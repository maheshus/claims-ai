# This simulates the raw JSON response from an Epic FHIR API

EXAMPLE = {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "link": [
        {
            "relation": "self",
            "url": "https://hostname/instance/api/FHIR/R4/ExplanationOfBenefit?created=2023-10-25 ",
        }
    ],
    "entry": [
        {
            "link": [
                {
                    "relation": "self",
                    "url": "https://hostname/instance/api/FHIR/R4/ExplanationOfBenefit/e6zWf-oe-rpcxYuge6fFecZmS46ucEahDtkwhXPQMaMg3",
                }
            ],
            "fullUrl": "https://hostname/instance/api/FHIR/R4/ExplanationOfBenefit/e6zWf-oe-rpcxYuge6fFecZmS46ucEahDtkwhXPQMaMg3",
            "resource": {
                "resourceType": "ExplanationOfBenefit",
                "id": "e6zWf-oe-rpcxYuge6fFecZmS46ucEahDtkwhXPQMaMg3",
                "extension": [
                    {
                        "url": "https://open.epic.com/fhir/extensions/TaxID",
                        "valueIdentifier": {
                            "use": "usual",
                            "type": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                        "code": "TAX",
                                        "display": "Tax ID number",
                                    }
                                ]
                            },
                            "system": "urn:oid:2.16.840.1.113883.4.4",
                            "value": "535353536",
                        },
                    }
                ],
                "identifier": [
                    {
                        "use": "usual",
                        "type": {
                            "coding": [
                                {
                                    "system": "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBIdentifierType",
                                    "code": "uc",
                                    "display": "Unique Claim ID",
                                }
                            ]
                        },
                        "system": "urn:oid:1.2.840.114350.1.13.5325.1.7.2.677677",
                        "value": "1000003786",
                    }
                ],
                "status": "active",
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/claim-type",
                            "code": "institutional",
                            "display": "Institutional",
                        }
                    ]
                },
                "use": "claim",
                "patient": {
                    "reference": "Patient/eDfAD2JQzIh.HxyJNMVp3xQ3",
                    "display": "Fhir, Member",
                },
                "billablePeriod": {"start": "2023-10-10", "end": "2023-10-14"},
                "created": "2023-10-25T22:23:06Z",
                "insurer": {
                    "identifier": {
                        "use": "usual",
                        "system": "http://open.epic.com/FHIR/StructureDefinition/payer-id",
                        "value": "7443",
                    },
                    "display": "MC Payor",
                },
                "provider": {
                    "type": "Organization",
                    "identifier": {
                        "use": "usual",
                        "system": "http://hl7.org/fhir/sid/us-npi",
                        "value": "1000016976",
                    },
                    "display": "Lakeview Billing Provider",
                },
                "payee": {
                    "type": {
                        "coding": [
                            {
                                "system": "urn:oid:1.2.840.114350.1.72.1.7.7.10.677677.18931",
                                "code": "2",
                                "display": "Vendor",
                            }
                        ]
                    },
                    "party": {
                        "identifier": {
                            "use": "usual",
                            "system": "http://hl7.org/fhir/sid/us-npi",
                            "value": "1000016976",
                        },
                        "display": "Lakeview Billing Provider",
                    },
                },
                "facility": {"display": "Lakeside Hospital"},
                "outcome": "partial",
                "disposition": "Clean",
                "supportingInfo": [
                    {
                        "sequence": 1,
                        "category": {
                            "coding": [
                                {
                                    "system": "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBSupportingInfoType",
                                    "code": "clmrecvddate",
                                    "display": "Claim Received Date",
                                }
                            ]
                        },
                        "timingDate": "2023-10-25",
                    },
                    {
                        "sequence": 2,
                        "category": {
                            "coding": [
                                {
                                    "system": "urn:oid:1.2.840.114350.1.72.1.7.7.10.696784.73001",
                                    "code": "2",
                                    "display": "Occurrence Span Code",
                                }
                            ]
                        },
                        "code": {
                            "coding": [{"system": "http://www.nubc.org", "code": "71"}]
                        },
                        "timingPeriod": {"start": "2023-10-01", "end": "2023-10-02"},
                    },
                    {
                        "sequence": 3,
                        "category": {
                            "coding": [
                                {
                                    "system": "urn:oid:1.2.840.114350.1.72.1.7.7.10.696784.73001",
                                    "code": "3",
                                    "display": "Admission Type",
                                },
                                {
                                    "system": "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBSupportingInfoType",
                                    "code": "admtype",
                                    "display": "Admission Type",
                                },
                            ]
                        },
                        "code": {
                            "coding": [{"system": "http://www.nubc.org", "code": "1"}]
                        },
                    },
                    {
                        "sequence": 4,
                        "category": {
                            "coding": [
                                {
                                    "system": "urn:oid:1.2.840.114350.1.72.1.7.7.10.696784.73001",
                                    "code": "4",
                                    "display": "Admission Source",
                                },
                                {
                                    "system": "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBSupportingInfoType",
                                    "code": "pointoforigin",
                                    "display": "Point Of Origin",
                                },
                            ]
                        },
                        "code": {
                            "coding": [{"system": "http://www.nubc.org", "code": "1"}]
                        },
                    },
                    {
                        "sequence": 5,
                        "category": {
                            "coding": [
                                {
                                    "system": "urn:oid:1.2.840.114350.1.72.1.7.7.10.696784.73001",
                                    "code": "5",
                                    "display": "Discharge Disposition",
                                },
                                {
                                    "system": "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBSupportingInfoType",
                                    "code": "discharge-status",
                                    "display": "Discharge Status",
                                },
                            ]
                        },
                        "code": {
                            "coding": [
                                {
                                    "system": "http://www.nubc.org/patient-discharge",
                                    "code": "01",
                                }
                            ]
                        },
                    },
                ],
                "diagnosis": [
                    {
                        "sequence": 1,
                        "diagnosisCodeableConcept": {
                            "coding": [
                                {
                                    "system": "http://hl7.org/fhir/sid/icd-10",
                                    "code": "T78.07",
                                    "display": "Anaphylactic reaction due to milk and dairy products",
                                }
                            ]
                        },
                        "type": [
                            {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                                        "code": "admitting",
                                        "display": "Admitting Diagnosis",
                                    }
                                ]
                            }
                        ],
                    },
                    {
                        "sequence": 2,
                        "diagnosisCodeableConcept": {
                            "coding": [
                                {
                                    "system": "http://hl7.org/fhir/sid/icd-10",
                                    "code": "T78.07",
                                    "display": "Anaphylactic reaction due to milk and dairy products",
                                }
                            ]
                        },
                        "onAdmission": {
                            "coding": [
                                {
                                    "system": "https://www.cms.gov/Medicare/Medicare-Fee-for-Service-Payment/HospitalAcqCond/Coding",
                                    "code": "2",
                                    "display": "Y - Yes",
                                }
                            ]
                        },
                        "packageCode": {
                            "coding": [
                                {
                                    "system": "https://www.cms.gov/Medicare/Medicare-Fee-for-Service-Payment/AcuteInpatientPPS/MS-DRG-Classifications-and-Software",
                                    "code": "916",
                                    "display": "Allergic reactions",
                                }
                            ]
                        },
                    },
                ],
                "insurance": [
                    {
                        "focal": True,
                        "coverage": {
                            "identifier": {
                                "use": "usual",
                                "system": "http://open.epic.com/FHIR/StructureDefinition/member-id",
                                "value": "xxxxxx01",
                            }
                        },
                    }
                ],
                "item": [
                    {
                        "sequence": 1,
                        "diagnosisSequence": [2],
                        "revenue": {
                            "coding": [
                                {
                                    "system": "http://www.nubc.org",
                                    "code": "0100",
                                    "display": "All-Inclusive Rate - All-Inclusive Room and Board Plus Ancillary",
                                }
                            ]
                        },
                        "productOrService": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/data-absent-reason",
                                    "code": "not-applicable",
                                    "display": "Not Applicable",
                                }
                            ]
                        },
                        "servicedPeriod": {"start": "2023-10-10", "end": "2023-10-14"},
                        "locationCodeableConcept": {
                            "coding": [
                                {
                                    "system": "urn:oid:1.2.840.114350.1.13.5325.1.7.10.698482.18050",
                                    "code": "21",
                                    "display": "Inpatient Hospital",
                                }
                            ]
                        },
                        "quantity": {
                            "value": 4,
                            "unit": "Units",
                            "system": "http://unitsofmeasure.org",
                            "code": "[arb'U]",
                        },
                        "net": {"value": 1250, "currency": "USD"},
                    }
                ],
                "adjudication": [
                    {
                        "category": {
                            "coding": [
                                {
                                    "system": "http://www.x12.org/codes/claim-adjustment-group-codes/",
                                    "code": "PR",
                                    "display": "Patient Responsibility",
                                }
                            ]
                        },
                        "reason": {
                            "coding": [
                                {
                                    "system": "http://www.x12.org/codes/claim-adjustment-reason-codes",
                                    "code": "3",
                                    "display": "Co-payment Amount",
                                }
                            ]
                        },
                        "amount": {"value": 25.00, "currency": "USD"},
                    },
                    {
                        "category": {
                            "coding": [
                                {
                                    "system": "http://www.x12.org/codes/claim-adjustment-group-codes/",
                                    "code": "CO",
                                    "display": "Contractual Obligation",
                                }
                            ]
                        },
                        "reason": {
                            "coding": [
                                {
                                    "system": "http://www.x12.org/codes/claim-adjustment-reason-codes",
                                    "code": "45",
                                    "display": "Chgs excd fee sch/max allowable",
                                }
                            ]
                        },
                        "amount": {"value": 1165, "currency": "USD"},
                    },
                ],
                "total": [
                    {
                        "category": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                    "code": "benefit",
                                    "display": "Benefit Amount",
                                }
                            ]
                        },
                        "amount": {"value": 25, "currency": "USD"},
                    },
                    {
                        "category": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                    "code": "copay",
                                    "display": "CoPay",
                                }
                            ]
                        },
                        "amount": {"value": 25, "currency": "USD"},
                    },
                    {
                        "category": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/adjudication",
                                    "code": "submitted",
                                    "display": "Submitted Amount",
                                }
                            ]
                        },
                        "amount": {"value": 1250, "currency": "USD"},
                    },
                ],
                "payment": {"date": "2023-10-25"},
            },
            "search": {"mode": "match"},
        },
        {
            "fullUrl": "urn:uuid:5d64e8e6-0dbd-44c9-9fff-8c14f2fd9ac9",
            "resource": {
                "resourceType": "OperationOutcome",
                "issue": [
                    {
                        "severity": "warning",
                        "code": "processing",
                        "details": {
                            "coding": [
                                {
                                    "system": "urn:oid:1.2.840.114350.1.13.5325.1.7.2.657369",
                                    "code": "4119",
                                    "display": "This response includes information available to the authorized user at the time of the request. It may not contain the entire record available in the system.",
                                }
                            ],
                            "text": "This response includes information available to the authorized user at the time of the request. It may not contain the entire record available in the system.",
                        },
                    }
                ],
            },
            "search": {"mode": "outcome"},
        },
    ],
}

PaidInpatientDRGClaim = {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "entry": [
        {
            "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ExplanationOfBenefit/ePaidDRG871-20250810",
            "resource": {
                "resourceType": "ExplanationOfBenefit",
                "id": "ePaidDRG871-20250810",
                "identifier": [
                    {
                        "type": {
                            "coding": [
                                {
                                    "system": "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBIdentifierType",
                                    "code": "uc",
                                    "display": "Unique Claim ID",
                                }
                            ]
                        },
                        "system": "urn:oid:1.2.840.114350.1.13.861.1.7.2.677677",
                        "value": "2500891234",
                    }
                ],
                "status": "active",
                "type": {"coding": [{"code": "institutional"}]},
                "use": "claim",
                "patient": {
                    "reference": "Patient/eDfAD2JQzIh.HxyJNMVp3xQ3",
                    "display": "Wilson, Michael",
                },
                "billablePeriod": {"start": "2025-07-15", "end": "2025-07-21"},
                "created": "2025-07-30T12:18:44Z",
                "insurer": {"display": "UnitedHealthcare"},
                "facility": {"display": "St. Mary Medical Center"},
                "outcome": "complete",
                "disposition": "Paid per contract",
                "diagnosis": [
                    {
                        "sequence": 1,
                        "diagnosisCodeableConcept": {
                            "coding": [{"code": "A41.9", "display": "Sepsis"}]
                        },
                    },
                    {
                        "sequence": 2,
                        "diagnosisCodeableConcept": {"coding": [{"code": "J96.01"}]},
                        "packageCode": {"coding": [{"code": "871"}]},
                    },
                ],
                "item": [
                    {
                        "sequence": 1,
                        "revenue": {"coding": [{"code": "0100"}]},
                        "productOrService": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/data-absent-reason",
                                    "code": "not-applicable",
                                }
                            ]
                        },
                        "net": {"value": 72850.00, "currency": "USD"},
                    }
                ],
                "adjudication": [
                    {
                        "category": {"coding": [{"code": "CO"}]},
                        "reason": {"coding": [{"code": "45"}]},
                        "amount": {"value": 36850.00},
                    },
                    {
                        "category": {"coding": [{"code": "PR"}]},
                        "reason": {"coding": [{"code": "1"}]},
                        "amount": {"value": 1000.00},
                    },
                ],
                "total": [
                    {
                        "category": {"coding": [{"code": "submitted"}]},
                        "amount": {"value": 72850.00},
                    },
                    {
                        "category": {"coding": [{"code": "benefit"}]},
                        "amount": {"value": 35000.00},
                    },
                ],
                "payment": {"amount": {"value": 35000.00}, "date": "2025-08-10"},
            },
            "search": {"mode": "match"},
        },
        {
            "resource": {
                "resourceType": "OperationOutcome",
                "issue": [{"details": {"coding": [{"code": "4119"}]}}],
            },
            "search": {"mode": "outcome"},
        },
    ],
}

DeniedClaimC096NonCovered = {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "entry": [
        {
            "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ExplanationOfBenefit/eDeniedCO96-202508",
            "resource": {
                "resourceType": "ExplanationOfBenefit",
                "id": "eDeniedCO96-202508",
                "identifier": [
                    {
                        "type": {"coding": [{"code": "uc"}]},
                        "system": "urn:oid:1.2.840.114350.1.13.861.1.7.2.677677",
                        "value": "2500998765",
                    }
                ],
                "status": "active",
                "type": {"coding": [{"code": "institutional"}]},
                "use": "claim",
                "patient": {"reference": "Patient/eDfAD2JQzIh.HxyJNMVp3xQ3"},
                "billablePeriod": {"start": "2025-06-01", "end": "2025-06-03"},
                "created": "2025-06-15T09:22:11Z",
                "outcome": "complete",
                "disposition": "Denied - Service not covered under plan",
                "adjudication": [
                    {
                        "category": {"coding": [{"code": "CO"}]},
                        "reason": {"coding": [{"code": "96"}]},
                        "amount": {"value": 98500.00},
                    }
                ],
                "total": [
                    {
                        "category": {"coding": [{"code": "benefit"}]},
                        "amount": {"value": 0.00},
                    }
                ],
                "payment": {"amount": {"value": 0.00}},
                "processNote": [
                    {
                        "text": "Procedure considered experimental/investigational per payer policy."
                    }
                ],
            },
        }
    ],
}

PendingClaim = {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "entry": [
        {
            "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ExplanationOfBenefit/ePendingRecords-202508",
            "resource": {
                "resourceType": "ExplanationOfBenefit",
                "id": "ePendingRecords-202508",
                "identifier": [
                    {
                        "type": {
                            "coding": [
                                {
                                    "system": "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBIdentifierType",
                                    "code": "uc",
                                }
                            ]
                        },
                        "system": "urn:oid:1.2.840.114350.1.13.861.1.7.2.677677",
                        "value": "2500778899",
                    }
                ],
                "status": "active",
                "type": {"coding": [{"code": "institutional"}]},
                "use": "claim",
                "patient": {"reference": "Patient/eDfAD2JQzIh.HxyJNMVp3xQ3"},
                "billablePeriod": {"start": "2025-08-01", "end": "2025-08-05"},
                "created": "2025-08-10T14:33:21Z",
                "outcome": "queued",
                "disposition": "Pending - Additional documentation required",
                "supportingInfo": [
                    {
                        "sequence": 99,
                        "category": {"coding": [{"code": "medicalrecords"}]},
                        "timingDate": "2025-08-11",
                    }
                ],
                "total": [
                    {
                        "category": {"coding": [{"code": "submitted"}]},
                        "amount": {"value": 112400.00},
                    }
                ],
            },
        }
    ],
}

PartiallyPaidHighPatientResponsibility = {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "entry": [
        {
            "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ExplanationOfBenefit/ePartialHighPR-202508",
            "resource": {
                "resourceType": "ExplanationOfBenefit",
                "id": "ePartialHighPR-202508",
                "identifier": [
                    {
                        "type": {"coding": [{"code": "uc"}]},
                        "system": "urn:oid:1.2.840.114350.1.13.861.1.7.2.677677",
                        "value": "2500665544",
                    }
                ],
                "status": "active",
                "type": {"coding": [{"code": "professional"}]},
                "use": "claim",
                "patient": {"reference": "Patient/eDfAD2JQzIh.HxyJNMVp3xQ3"},
                "billablePeriod": {"start": "2025-05-20"},
                "created": "2025-05-28T11:11:11Z",
                "outcome": "partial",
                "disposition": "Member responsibility $4,250 (deductible + coinsurance)",
                "adjudication": [
                    {
                        "category": {"coding": [{"code": "PR"}]},
                        "reason": {"coding": [{"code": "1"}]},
                        "amount": {"value": 2500.00},
                    },
                    {
                        "category": {"coding": [{"code": "PR"}]},
                        "reason": {"coding": [{"code": "2"}]},
                        "amount": {"value": 1750.00},
                    },
                ],
                "total": [
                    {
                        "category": {"coding": [{"code": "benefit"}]},
                        "amount": {"value": 12250.00},
                    }
                ],
                "payment": {"amount": {"value": 12250.00}, "date": "2025-06-05"},
            },
        }
    ],
}

RejectedClaim = {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "entry": [
        {
            "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ExplanationOfBenefit/eRejectedMissingFields-202508",
            "resource": {
                "resourceType": "ExplanationOfBenefit",
                "id": "eRejectedMissingFields-202508",
                "identifier": [
                    {
                        "type": {"coding": [{"code": "uc"}]},
                        "system": "urn:oid:1.2.840.114350.1.13.861.1.7.2.677677",
                        "value": "2500112233",
                    }
                ],
                "status": "cancelled",
                "type": {"coding": [{"code": "institutional"}]},
                "use": "claim",
                "patient": {"reference": "Patient/eDfAD2JQzIh.HxyJNMVp3xQ3"},
                "billablePeriod": {"start": "2025-07-01", "end": "2025-07-03"},
                "created": "2025-07-05T08:44:22Z",
                "outcome": "error",
                "disposition": "Rejected - Missing required fields",
                "processNote": [
                    {
                        "text": "Missing Admission Source (FL14) and Patient Discharge Status (FL17)"
                    }
                ],
                "total": [
                    {
                        "category": {"coding": [{"code": "submitted"}]},
                        "amount": {"value": 89000.00},
                    }
                ],
            },
        }
    ],
}


# Helper to find the unique claim id
def _extract_uc_id(resource):
    """Extract the CARIN 'uc' Unique Claim ID – works on 100% of Epic production EOBs"""
    identifiers = resource.get("identifier") or []
    for ident in identifiers:
        typ = ident.get("type", {})
        codings = typ.get("coding") or []
        for coding in codings:
            if coding.get("code") == "uc":
                return ident.get("value")
            # Some Epic instances also use the system URL as a secondary hint
            if (
                coding.get("system")
                == "http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBIdentifierType"
                and coding.get("code") == "uc"
            ):
                return ident.get("value")
    # Final fallback – should literally never happen on real Epic data
    return resource.get("id")


# Build the Lookup Table (Index by Business ID)
_raw_resources = [
    EXAMPLE["entry"][0]["resource"],
    PaidInpatientDRGClaim["entry"][0]["resource"],
    DeniedClaimC096NonCovered["entry"][0]["resource"],
    PendingClaim["entry"][0]["resource"],
    PartiallyPaidHighPatientResponsibility["entry"][0]["resource"],
    RejectedClaim["entry"][0]["resource"],
]

_MOCK_DB = {_extract_uc_id(res): res for res in _raw_resources}


# Public Accessor
def get_mock_claim(claim_id: str):
    return _MOCK_DB.get(claim_id)
