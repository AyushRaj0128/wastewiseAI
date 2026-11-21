from app.main import WasteRecord, RecordsPayload, baseline

def test_baseline_forecast_has_horizon():
    payload = RecordsPayload(records=[WasteRecord(date="2026-01-01", location="Campus", category="Organic", quantityKg=100)], horizon=7)
    result = baseline(payload.records, payload.horizon)
    assert len(result["points"]) == 7
    assert result["predictedWaste"] > 0
