using UnityEngine;
using System;

[System.Serializable]
public class GraffitiSpot
{
    public string spotId;
    public SpotType type;
    public Vector2 coordinates; // Lat/Lng
    public float riskFactor; // 0.1 - 1.0
    public int baseScoreValue;
    public string currentGraffitiId; // If already painted
    public string owningCrewId;
    public DateTime lastPainted;
    public bool isActive;
}

public enum SpotType { Wall, ElectricalBox, Bridge, Train, Billboard }
