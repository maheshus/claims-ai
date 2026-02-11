import copy

from sqlalchemy.orm import Session

from app.mock_data import get_mock_claim
from app.models import (
    AdjudicationValueCode,
    CarcCode,
    ClaimAdjustmentGroupCode,
    RarcCode,
)


def _lookup_category(db: Session, code: str):
    val = (
        db.query(AdjudicationValueCode)
        .filter(AdjudicationValueCode.code == code)
        .first()
    )
    if val:
        return val.display, val.definition, None
    group = (
        db.query(ClaimAdjustmentGroupCode)
        .filter(ClaimAdjustmentGroupCode.code == code)
        .first()
    )
    if group:
        return group.description, group.description, group.responsibility
    return "Unknown", "Unknown", None


def _lookup_reason(db: Session, code: str, system: str):
    if "remittance-advice-remark-codes" in system:
        rarc = db.query(RarcCode).filter(RarcCode.code == code).first()
        return "RARC", rarc.description if rarc else "Unknown RARC", None
    else:
        carc = db.query(CarcCode).filter(CarcCode.code == code).first()
        return (
            "CARC",
            carc.description if carc else "Unknown CARC",
            carc.action_hint if carc else None,
        )


def _extract_diagnoses(claim_resource: dict) -> list:
    diagnoses = []
    for diag in claim_resource.get("diagnosis", []):
        coding = diag.get("diagnosisCodeableConcept", {}).get("coding", [{}])[0]
        diag_type = "Unknown"
        if diag.get("type"):
            diag_type = diag["type"][0].get("coding", [{}])[0].get("display", "Unknown")
        diagnoses.append(
            {
                "code": coding.get("code"),
                "description": coding.get("display", "Unknown"),
                "type": diag_type,
            }
        )
    return diagnoses


def _process_adjudication_list(db: Session, raw_adjudications: list) -> list:
    result = []
    for adj in raw_adjudications:
        amount = adj.get("amount", {}).get("value", 0.0)
        cat_code = adj.get("category", {}).get("coding", [{}])[0].get("code")
        reason_code = adj.get("reason", {}).get("coding", [{}])[0].get("code")
        reason_system = adj.get("reason", {}).get("coding", [{}])[0].get("system", "")

        entry = {"amount": amount, "currency": "USD"}
        if cat_code:
            label, definition, resp = _lookup_category(db, cat_code)
            entry.update(
                {
                    "category_code": cat_code,
                    "category_label": label,
                    "financial_responsibility": resp,
                }
            )
        if reason_code:
            r_type, desc, action = _lookup_reason(db, reason_code, reason_system)
            entry.update(
                {"reason_type": r_type, "reason_code": reason_code, "description": desc}
            )
            if action is not None:
                entry["action_needed"] = action
        result.append(entry)
    return result


def get_claim_summary(db: Session, claim_id: str):
    claim = get_mock_claim(claim_id)
    if not claim:
        return None

    summary = {
        "claim_id": claim_id,
        "fhir_id": claim.get("id"),
        "patient_name": claim.get("patient", {}).get("display", "Unknown"),
        "claim_status": claim.get(
            "disposition", "Not specified"
        ),  # e.g. Clean, Denied, Rejected
        "processing_status": claim.get("outcome", "unknown"),  # FHIR outcome
        "payment_date": claim.get("payment", {}).get("date", "Pending"),
        "service_period": {
            "start": claim.get("billablePeriod", {}).get("start"),
            "end": claim.get("billablePeriod", {}).get("end"),
        },
        "diagnoses": _extract_diagnoses(claim),
        "adjustments": _process_adjudication_list(db, claim.get("adjudication", [])),
        "line_items": [],
    }

    summary.update(
        {
            "billed_amount": next(
                (
                    t["amount"]["value"]
                    for t in claim.get("total", [])
                    if t.get("category", {}).get("coding", [{}])[0].get("code")
                    == "submitted"
                ),
                0.0,
            ),
            "paid_amount": next(
                (
                    t["amount"]["value"]
                    for t in claim.get("total", [])
                    if t.get("category", {}).get("coding", [{}])[0].get("code")
                    == "benefit"
                ),
                0.0,
            ),
            "patient_responsibility": sum(
                a["amount"]
                for a in summary["adjustments"]
                if a.get("category_code") == "PR"
            ),
            "contractual_writeoff": sum(
                a["amount"]
                for a in summary["adjustments"]
                if a.get("category_code") == "CO"
            ),
            "primary_diagnosis": next(
                (
                    f"{d['code']} – {d['description']}"
                    for d in summary["diagnoses"]
                    if d["type"] in ("principal", "Admitting Diagnosis")
                ),
                "Unknown",
            ),
            "drg_code": next(
                (
                    diag.get("packageCode", {}).get("coding", [{}])[0].get("code")
                    for diag in claim.get("diagnosis", [])
                    if diag.get("packageCode")
                ),
                None,
            ),
        }
    )

    for item in claim.get("item", []):
        service = "Unknown Service"
        if item.get("productOrService", {}).get("coding"):
            service = item["productOrService"]["coding"][0].get("display", service)
        elif item.get("revenue", {}).get("coding"):
            rev = item["revenue"]["coding"][0].get("code", "???")
            service = f"Revenue Code {rev}"

        summary["line_items"].append(
            {
                "service": service,
                "adjudications": _process_adjudication_list(
                    db, item.get("adjudication", [])
                ),
            }
        )

    return summary


def sanitize_for_agent(summary: dict) -> dict:
    """Remove PII and internal IDs before sending to AI"""
    safe = copy.deepcopy(summary)
    safe["patient_name"] = "REDACTED"
    safe.pop("fhir_id", None)
    return safe
