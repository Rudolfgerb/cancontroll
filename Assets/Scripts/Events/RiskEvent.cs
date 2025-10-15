using UnityEngine;
using System.Collections;

[System.Serializable]
public class RiskEvent
{
    public string eventId;
    public string message;
    public float riskMultiplier;
    public float duration;
    public EventType type;
}

public enum EventType {
    PedestrianSpotting,    // "Pedestrian spotted you!" -> ×1.5
    CarPassing,           // "Car passing by" -> ×1.2
    PolicePatrol,         // "Police patrol nearby" -> ×2.0
    GoodCover,            // "Found good cover" -> ×0.7
    NightFall             // "Darkness protects you" -> ×0.5
}
