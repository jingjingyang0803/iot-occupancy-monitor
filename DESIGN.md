# IoT System Design: Parcel Tracking for Valuable Items

## Abbreviations

- **3GPP** — 3rd Generation Partnership Project
- **4G/LTE** — Fourth Generation / Long-Term Evolution
- **BLE** — Bluetooth Low Energy
- **CoAP** — Constrained Application Protocol
- **GNSS** — Global Navigation Satellite System
- **GPS** — Global Positioning System
- **HTTP** — Hypertext Transfer Protocol
- **IoT** — Internet of Things
- **LoRa** — Long Range (LoRa modulation, used in LoRaWAN networks)
- **LTE-M** — LTE for Machines (also known as eMTC)
- **MQTT** — Message Queuing Telemetry Transport
- **NB-IoT** — Narrowband Internet of Things
- **RFID** — Radio-Frequency Identification
- **SIM/eSIM** — Subscriber Identity Module / embedded SIM
- **UWB** — Ultra-Wideband
- **WiFi** — Wireless Fidelity (IEEE 802.11)

## 1. Introduction

The Internet of Things (IoT) connects distributed devices that collect, process, and share data over networks. As IoT systems scale up, concerns such as reliability, energy use, security, and long-term operations become as important as the device hardware itself.

This report describes an IoT-based parcel tracking system intended for high-value shipments. Compared with conventional logistics tracking that optimizes for cost and throughput, the emphasis here is tighter visibility, stronger integrity of tracking records, and dependable operation under real transport conditions.

The design is presented through explicit trade-offs and the requirements that motivate them.

## 2. System Requirements

The system is designed to track valuable parcels during transportation across potentially large geographic areas.

Compared to standard logistics systems, stricter requirements apply due to the high value of the goods and the need to minimize uncertainty and risk.

The key requirements are:

- Near real-time (periodic) location tracking
- High reliability and system availability
- Secure communication and data integrity
- Wide-area coverage across different regions
- Scalability to support large numbers of shipments
- Reasonable operational and maintenance cost

In addition, the system must operate under practical constraints:

- Limited device power (battery-operated devices)
- Variable network conditions
- Long device lifetimes with minimal human intervention

These requirements serve as the basis for evaluating all design choices in the following sections.

### 2.1 Evaluation parameters for trade-off analysis

To compare design options consistently, the following operating assumptions are used throughout the trade-off analysis.

- **Update frequency (near real-time interpretation):** periodic updates, typically in the range of minutes to tens of minutes (e.g., 5–30 min) depending on risk, route, and battery constraints
- **Latency expectation:** minutes-level availability when coverage exists; delayed delivery is acceptable during coverage loss (store-and-forward)
- **Positioning expectation:** GNSS provides typical outdoor accuracy; performance degrades indoors/urban canyons (handled via fallbacks and facility events)
- **Outage handling assumption:** data should not be lost during typical outages; devices buffer locally and upload later
- **Security event assumption:** tamper/impact events are higher priority than routine telemetry and should be delivered as soon as connectivity is available

## 3. Tracking Method

This system is designed **only for high-value shipments**, where the main objective is to reduce uncertainty through near real-time visibility. Several tracking approaches exist in logistics; here they are evaluated specifically against the needs of valuable goods.

### 3.1 Baseline checkpoint evidence using barcode and RFID

Checkpoint scans provide chain-of-custody evidence (pickup, hub arrival, delivery). They are operationally mature and remain useful for high-value shipments, but they do not provide continuous visibility between checkpoints.

### 3.2 Primary in-transit tracking using GNSS and cellular IoT

An active tracking device provides near real-time visibility by sending periodic location and sensor telemetry. For low-power wide-area connectivity, “real-time” is typically implemented as **periodic (near real-time) updates** rather than continuous streaming.

### 3.3 Optional facility enhancement using BLE and UWB

In controlled facilities (warehouses, sorting centers, handoff points), BLE can provide zone-level events and UWB can provide higher-precision indoor positioning when required. These are add-ons, not replacements for wide-area connectivity.

### 3.4 Comparison of high-value shipment options

Because high-value logistics varies by route and risk, the solution is often **composed**: a primary wide-area method plus optional add-ons. Table 1 summarizes the main choices.

| Layer / choice | Pros | Cons | Typical use in a commercial high-value product |
| --- | --- | --- | --- |
| Baseline evidence: Barcode/RFID checkpoints | Low cost; operationally mature; clear handoff evidence | No visibility between checkpoints; depends on scan discipline | Keep as baseline for chain-of-custody, regardless of tracking technology |
| Primary tracking: GNSS + cellular IoT (NB-IoT / LTE-M) | Near real-time visibility; supports sensor monitoring and alerts; scalable via existing networks | Battery vs reporting trade-off; GNSS weak indoors; subscription + device management needed | Main in-transit layer for most high-value shipments |
| Add-ons (selected by route/risk): satellite / BLE or UWB / tamper | Fills coverage gaps; adds facility visibility; strengthens security evidence | Extra cost, ops complexity, and sometimes power impact | Enable only when justified (coverage gaps, indoor precision, theft risk) |

Add-on examples (used together with the primary layer when needed):

- **Positioning fallback:** Cell-ID / Wi-Fi when GNSS is degraded
- **Coverage fallback:** satellite on routes with long cellular gaps
- **Facility layer:** BLE zone events (low cost) or UWB (high precision)
- **Security:** tamper/open sensing or e-seal

### 3.5 Composition rules for selecting the right combination

Routes and risk profiles differ, so add-ons are enabled using clear selection rules:

#### 3.5.1 Coverage-driven add-ons

- **Cellular coverage gaps:** if a route regularly has multi-hour cellular outages (e.g., sea freight), add **satellite fallback** for critical updates.

#### 3.5.2 Facility-driven add-ons

- **Indoor precision requirement:** if a facility requires precise indoor location (not just “arrived”), add **UWB**; otherwise **BLE zone events** are sufficient.

#### 3.5.3 Security-driven add-ons

- **Theft/tamper risk:** if shipments are theft-sensitive, enable **tamper/open sensing** and define an escalation workflow.

#### 3.5.4 Power-driven configuration

- **Battery vs visibility:** use **adaptive reporting** (faster on movement/anomalies, slower when stationary) to protect battery life while keeping security responsiveness.

This is a deliberate trade-off: better visibility and faster operational response, in exchange for higher device cost and added system complexity. Silicon Labs (2023) notes that periodic monitoring can shift logistics operations from reactive handling to proactive intervention, which is especially relevant for high-value shipments.

## 4. Connectivity and Communication Design

This section evaluates communication technologies against the needs of wide-area coverage, reliability, and scalability. In high-value deployments, connectivity is typically layered: cellular IoT as the primary channel, with optional fallbacks (such as satellite) when the route demands it.

### 4.1 Technology screening and exclusions

WiFi and classic Bluetooth are not suitable as primary channels because they are short-range and depend on local infrastructure. They do not meet the wide-area requirement for in-transit tracking.

BLE remains useful in controlled environments such as warehouses, hubs, and handoff points, where receivers can be installed and maintained.

LoRa provides long-range communication with low power consumption, making it attractive for IoT applications. However, its deployment depends on specific infrastructure, which may not be available across all regions. This limits its scalability for global logistics systems.

Cellular IoT technologies such as NB-IoT and LTE-M, standardized by 3GPP, provide wide-area coverage using existing telecom infrastructure. This makes them more suitable for commercial deployment.

An important consideration from the course is that radio communication is significantly more energy-intensive than local processing. Therefore, communication must be minimized and carefully managed.

### 4.2 Selected connectivity with justification

NB-IoT is selected as the preferred option because it balances coverage, energy efficiency, and infrastructure availability. It adds recurring subscription cost, but it simplifies deployment and supports reliable wide-area operation. Near real-time tracking is implemented with adaptive reporting intervals rather than continuous transmission to keep power use manageable.

LTE-M is a practical alternative when mobility support and latency requirements are stricter, typically with higher energy use. NB-IoT typically provides deeper coverage and lower power consumption but supports lower data rates and higher latency. LTE-M, in contrast, supports better mobility (handover between cells) and lower latency, making it more suitable for highly mobile scenarios.

In practice, teams choose between NB-IoT and LTE-M based on route coverage, mobility behavior, power budget, and the operator’s network support.

BLE is a strong fit for short-range tracking because it is low cost and can run for long periods on small batteries. NB-IoT and LTE-M cover wide areas more efficiently than traditional cellular, but they are still better suited to periodic uplinks than continuous streaming. This is why update frequency must be treated as a power and cost decision, not only a product requirement.

### 4.3 Technology comparison summary

The key communication technologies can be compared based on their characteristics:

| Technology | Coverage | Power Consumption | Real-time Capability | Infrastructure Requirement | Typical Use Case |
| --- | --- | --- | --- | --- | --- |
| BLE | Short-range | Very low | High (local) | High (requires receivers) | Indoor tracking, warehouses |
| LoRa | Long-range | Very low | Low (periodic) | Medium (requires gateways) | Regional deployments |
| NB-IoT | Wide-area | Low | Medium (periodic updates) | Low (cellular network) | Global asset tracking |
| 4G/LTE | Wide-area | High | High | Low (cellular network) | High-power devices |

For routes with limited cellular coverage (e.g., sea freight or remote areas), satellite IoT can be used as a fallback channel for critical updates, although it introduces higher cost and power constraints.

## 5. Power Management

Power management is central to this design because device lifetime and operational cost depend heavily on energy use.

### 5.1 Core trade-off between update frequency and battery lifetime

Since the tracking devices are attached to moving parcels, they must rely on battery power. This introduces a fundamental trade-off between data transmission frequency and battery lifetime.

Frequent updates improve real-time tracking accuracy but significantly increase energy consumption. Conversely, infrequent updates conserve energy but reduce system responsiveness.

### 5.2 Power strategy using sleep cycles and scheduled sensing

To balance these factors, the system uses periodic transmission with low-power modes. Devices remain asleep for most of the time and wake mainly to sample location/sensors and transmit data.

In addition, GPS positioning itself can be energy-intensive (especially for frequent fixes), so location sampling should be scheduled (e.g., motion-triggered or interval-based) alongside communication scheduling.

From a commercial perspective, optimizing battery life is essential to reduce maintenance costs and ensure reliable operation throughout the shipment lifecycle.

If optional channels such as satellite are used, reporting frequency and payload size typically need to be reduced further to remain within practical battery and cost limits.

### 5.3 Handling intermittent connectivity using store-and-forward

Connectivity reliability also affects power strategy and data transmission design. Intermittent connectivity is common on long routes and inside vehicles/containers. Silicon Labs (2023) notes that devices can buffer data locally during coverage loss and upload it once connectivity returns, which prevents routine telemetry and critical events from being lost.

In practice, asset tracking devices may use different power strategies, including rechargeable batteries, replaceable batteries, or even solar-assisted charging.

Industry solutions show that battery life can range from months to years depending on transmission frequency and connectivity type. This further emphasizes the importance of balancing energy consumption with tracking requirements in system design.

### 5.4 Battery lifetime estimation at a high level

To justify the reporting interval in a design-oriented way, an approximate energy budget is considered (exact values depend on hardware, environment, and network conditions).

Key takeaway for design comparison:

- **More frequent updates** increase GNSS fixes and radio transmissions, reducing battery life and increasing connectivity cost.
- **Less frequent updates** preserve battery but reduce visibility and can delay anomaly detection.

Therefore, **adaptive reporting** (faster on movement/anomalies, slower when stationary) is a practical compromise for commercial high-value tracking.

## 6. Sensors and Data Reliability

To keep tracking data reliable and actionable, the system must balance sensor selection with practical limits such as power and cost.

### 6.1 Sensor selection and measurement goals

GPS is used as the primary source of location data. Additional sensors, such as temperature and acceleration sensors, can provide valuable insights into environmental conditions and handling.

Beyond location, many commercial tracking programs monitor conditions such as temperature and physical impact. For sensitive goods (for example pharmaceuticals), this kind of telemetry is often the difference between “arrived” and “arrived in acceptable condition.” Silicon Labs (2023) discusses how smart tracking supports this end-to-end visibility.

For robustness, positioning can also use fallbacks such as cellular-based estimates (Cell-ID) or Wi-Fi positioning when GNSS is degraded (e.g., indoors or in urban canyons). In controlled facilities, BLE/UWB infrastructure can provide additional location context or zone-level events.

### 6.2 Data uncertainty and interpretation

IoT data should be treated as indicative rather than absolute. Sensor readings are affected by environment, device placement, and calibration, which introduces uncertainty.

Reliability improves when signals are combined. For example, fusing location with motion can help identify anomalies such as unexpected stops, detours, or impacts.

Additional sensors also increase cost and power consumption, so they are enabled only when the shipment value and risk justify the overhead.

## 7. System Architecture and Computing Paradigm

To support scalable deployment and centralized operations, the system uses a cloud-based architecture.

In this model, tracking devices send data directly to cloud services, where it is stored, processed, and made accessible to users.

Cloud-based architecture simplifies system design and supports large-scale deployment. It enables centralized monitoring, data analytics, and integration with user interfaces.

However, this approach introduces dependency on network connectivity and may increase latency. Alternative approaches, such as edge or gateway-based processing, could reduce communication overhead and improve responsiveness.

Edge computing could reduce latency and communication overhead in some scenarios. However, it also increases device complexity and cost, which conflicts with a low-power, low-maintenance tracking device. For this reason, cloud-based processing is the more practical default.

### Parcel Tracking System Architecture

![Screenshot 2026-04-21 at 14.56.50.png](attachment:c0dd87e7-ff0f-44ce-8840-1a524c56d104:Screenshot_2026-04-21_at_14.56.50.png)

### System Architecture Overview

The system follows a cloud-based IoT architecture consisting of four main components: tracking devices, communication network, cloud platform, and user interface.

### Constraints (Key Design Limits)

- **Device (Tracking device):** *Low Power* (battery-operated, constrained hardware)
- **Network (NB-IoT / cellular):** *Coverage* (depends on telecom availability along routes)
- **Cloud platform:** *Scalability* (must handle many devices and data streams reliably)

### 7.1 Key components

- **Tracking device:** GNSS + sensors + cellular IoT, with optional satellite fallback depending on route.
- **Communication:** cellular network for routine telemetry; satellite as a fallback where needed.
- **Cloud platform:** ingestion, data storage, timeline fusion, and alert routing.
- **User interface:** dashboard, alerts, and audit trail.

### 7.2 Data flow and data model

To make the system implementable, device telemetry can be structured into two primary message types:

- **Periodic telemetry (location update):** timestamp, location (GNSS and/or fallback), battery level, signal quality, optional sensor summary
- **Event telemetry (alerts):** event type (tamper/open, impact, temperature out-of-range), severity, timestamp, last known location, context snapshot

Cloud processing responsibilities:

- **Ordering + de-duplication:** handle retries, out-of-order uploads, and store-and-forward bursts
- **Timeline fusion:** merge GNSS points, cellular/Wi-Fi fallback estimates, and facility events (BLE/UWB) into a unified shipment timeline with confidence flags

This fusion process assigns confidence levels to different location sources and resolves conflicts between them.

- **Alert routing:** map events to operational recipients and escalation rules

### **7.3 Example telemetry message and data flow**

A typical telemetry message sent by the tracking device can be structured as:

```
{
  "device_id":"123456",
  "timestamp":"2026-04-29T10:15:00Z",
  "location": {
    "lat":61.4978,
    "lon":23.7610
  },
  "battery":78,
  "signal_quality":-95,
  "temperature":6.5,
  "event":null
}
```

For event-driven alerts, the message may include:

```
{
  "device_id":"123456",
  "timestamp":"2026-04-29T10:18:12Z",
  "event":"tamper_detected",
  "severity":"high",
  "location": {
    "lat":61.4980,
    "lon":23.7625
  }
}
```

The data flow in the cloud platform typically follows these steps:

1. **Ingestion layer:** receives MQTT messages via a broker
2. **Message queue / buffer:** handles bursts and store-and-forward uploads
3. **Processing layer:** performs validation, de-duplication, and enrichment
4. **Storage layer:** saves structured telemetry and event data
5. **Application layer:** updates dashboards and triggers alerts

This structured pipeline ensures that delayed or out-of-order messages can still be integrated into a consistent shipment timeline.

### 7.4 Notes on scalability and reliability

The ingestion and processing layers are designed to handle bursts after reconnection (store-and-forward) and large numbers of devices. De-duplication and ordering in the cloud help keep the shipment timeline consistent.

## 8. Communication Protocol Trade-offs

The protocol choice affects bandwidth use, reliability under weak coverage, and how easily the backend can scale.

### 8.1 Protocol options in this context

For this parcel-tracking design, the main question is how to ship small telemetry messages and occasional high-priority alerts reliably, without keeping devices awake longer than necessary.

### 8.2 Selected protocol direction

MQTT is a good fit for this system because it supports lightweight telemetry, asynchronous delivery, and scalable fan-out through a broker. It also matches the store-and-forward behavior needed when devices reconnect and upload buffered data.

Payloads are kept small to reduce transmission time, energy consumption, and cellular data cost.

HTTP remains useful for configuration and occasional device management calls, but it is not ideal as the primary telemetry channel because request overhead and connection setup can waste energy.

CoAP is a reasonable alternative for constrained environments, especially when a REST-like model is preferred. In this design, MQTT is chosen mainly for operational simplicity at scale and the maturity of cloud IoT tooling.

A high-level comparison is shown below:

| Protocol | Communication Model | Overhead | Advantages | Limitations |
| --- | --- | --- | --- | --- |
| HTTP | Request–Response | High | Widely supported, simple | Inefficient for constrained devices |
| MQTT | Publish–Subscribe | Low | Efficient, scalable, asynchronous | Requires broker (potential single point of failure) |
| CoAP | Request–Response (UDP) | Low | Lightweight, suitable for IoT | Less mature ecosystem |

### 8.3 MQTT Topic Structure and QoS Strategy for Parcel Tracking

In this system, MQTT topics are structured to support scalable and organized ingestion. A typical topic hierarchy is:

- `parcel/{device_id}/telemetry` — periodic location and sensor updates
- `parcel/{device_id}/event` — high-priority alerts (e.g., tamper, impact)
- `parcel/{device_id}/status` — device health and battery reports

MQTT Quality of Service (QoS) levels are selected to balance reliability and energy consumption:

- **QoS 0** for frequent telemetry (lowest overhead)
- **QoS 1** for critical events (at-least-once delivery)
- **QoS 2** is avoided due to higher overhead

Devices keep persistent sessions when possible, so messages can be delivered after reconnection (supports store-and-forward during outages). A keep-alive mechanism helps the backend detect inactive or disconnected devices.

**Summary:** QoS 0 saves power for frequent telemetry; QoS 1 improves delivery of critical events; persistent sessions support store-and-forward after outages.

### 8.4 LwM2M for device management

In addition to MQTT for telemetry, the system can use **LwM2M (Lightweight M2M)** for standardized device management. This is useful when managing many tracking devices over long lifetimes.

Typical roles:

- **LwM2M Client:** runs on the tracking device and exposes device resources (e.g., device info, connectivity status, firmware update state).
- **LwM2M Server:** manages the device fleet (read/write configuration, execute commands, observe values, trigger firmware updates).
- **Bootstrap Server:** provisions initial security credentials and server configuration.

How it fits this design:

- **Telemetry path:** keep MQTT for high-rate telemetry and event messages (simple ingestion at scale).
- **Management path:** use LwM2M for provisioning, configuration changes, remote diagnostics, and firmware updates.
- **Data model:** LwM2M Objects/Resources provide a standard way to represent things like battery, network status, and firmware state.

## 9. Security and Lifecycle Considerations

Security must be considered across the full lifecycle, not only during data transmission, because field devices and backend systems are long-lived and exposed to practical threats.

### 9.1 Communication security for in-transit protection

The system implements:

- Encrypted transport for telemetry and alerts
- Per-device identity (provisioned credentials) so shipments are tied to a known device
- Integrity checks and auditability so that location and security events are hard to forge or silently alter

### 9.2 Lifecycle security for manufacturing, provisioning, and updates

However, security is not limited to communication. It must also address risks during manufacturing, deployment, and maintenance.

Devices operating in the field for extended periods must support secure updates and proper identity management. Failure to address lifecycle security can lead to long-term vulnerabilities.

From a commercial perspective, security breaches can result in financial loss, reputational damage, and reduced customer trust, making security a critical design requirement.

For high-value goods, security monitoring can be strengthened by adding tamper-evidence features (e.g., light/open detection, seal status, impact events) and integrating alarms into operational response workflows.

### 9.3 Threat model for high-value shipments

Typical threats and mitigations include:

- **Device removal / replacement:** tamper switches, seal status, binding device ID to shipment in the backend
- **Signal jamming / prolonged offline:** offline detection rules, store-and-forward, escalation if silence exceeds a threshold
- **GNSS spoofing / location anomalies:** plausibility checks (speed/route constraints), multi-source positioning (GNSS + cellular fallback), anomaly flags
- **Unauthorized device onboarding:** secure provisioning, per-device credentials, certificate/key rotation
- **Backend account compromise:** least-privilege access, audit logs, alerting on abnormal access

## 10. Commercial Considerations and Trade-offs

Commercial viability depends on balancing cost, operational effort, and the level of visibility and security gained.

### 10.1 Cost drivers

The main cost drivers of IoT tracking include device hardware, cellular subscription fees, and operational overhead (deployment, monitoring, and battery/device replacement). These costs must be justified by reduced loss risk and improved visibility for high-value shipments.

### 10.2 Market context and solution landscape

In commercial deployments, selecting an asset tracking solution depends on multiple factors, including business size, industry requirements, and operational scale.

Commercial solutions range from low-cost trackers for small deployments to enterprise platforms that manage thousands of assets with analytics and integrations. In evaluations, the practical criteria are usually connectivity type, battery life, pricing model, and operational scalability. Many products mix RFID, BLE, Wi-Fi, and cellular to balance accuracy, cost, and coverage. The takeaway is simple: there is no single best technology; the right mix depends on the business case and the routes.

### 10.3 Value justification for IoT tracking

Whether the system is worth deploying depends on the value of the goods and the cost of loss, delay, or disputes. For low-value items, the added device and operations cost is hard to justify. For high-value shipments, better visibility and faster incident response can offset that cost.

### 10.4 Simple cost model per shipment

To compare option compositions, a simplified model can be used:

- **Per-shipment cost** ≈ (device amortization) + (connectivity cost) + (ops cost) + (loss/incident cost reduction benefit)

Where:

- Device amortization depends on **reuse cycles** and expected loss rate (recovery process matters).
- Connectivity cost depends on reporting interval, network, and any satellite fallback usage.
- Ops cost includes activation, monitoring, returns, battery service, and exception handling.

## 11. Platform Dependency and Long-term Risks

Long-term reliability depends not only on device performance, but also on platform choices and external dependencies that can change over time.

### 11.1 Vendor lock-in risk

Many IoT systems depend on specific cloud platforms and managed services. If a provider changes pricing, terms, or sunsets a product, operators may be forced into a costly migration.

To reduce this risk, the architecture should favor open protocols and modular components so that key pieces can be replaced without redesigning the whole system.

### 11.2 Operational dependency and device lifecycle risk

Beyond cloud vendor lock-in, device programs face long-term risks such as SIM/eSIM availability, roaming policy changes, and hardware end-of-life. Designing for modular connectivity and clear replacement processes reduces these risks.

## 12. Limitations and Future Improvements

The design still has limitations:

### 12.1 Current limitations

- Dependency on network coverage may reduce visibility on remote routes (e.g., long cellular gaps during sea freight)
- Battery constraints limit update frequency; higher reporting rates shorten lifetime and increase operations cost
- Higher cost restricts the solution to high-value shipments where loss prevention and traceability justify the expense

### 12.2 Future improvements

Future improvements could include hybrid tracking that mixes event-based evidence (facility/checkpoint events) with periodic IoT telemetry, to reduce cost on low-risk legs while keeping high-risk coverage.

Other improvements include better anomaly detection, clearer device recovery/returns workflows, and expanded multi-network support (roaming policy tuning plus satellite fallback on the routes that need it).

## 13. Conclusion

This report described an IoT-based parcel tracking system for high-value shipments. The proposed solution is layered: checkpoint evidence provides chain-of-custody, while a tracking device adds periodic visibility and security events during transit.

### 13.1 Final design summary

| Design element | Choice | Rationale (high-value shipments) |
| --- | --- | --- |
| Tracking approach | GNSS + cellular IoT as primary, plus checkpoint evidence | Provides near real-time visibility while retaining handoff records for accountability |
| Connectivity | NB-IoT (primary), LTE-M (alternative), satellite (fallback by route) | NB-IoT supports periodic updates with good power efficiency; alternatives cover mobility/coverage gaps |
| Positioning | GNSS with cellular/Wi-Fi fallback; BLE/UWB events in facilities (optional) | Improves robustness when GNSS is degraded and strengthens facility-level traceability |
| Sensing | Temperature + motion/impact + tamper/open indicators (as needed) | Aligns with high-value risks (damage, theft, chain-of-custody disputes) |
| Protocols | MQTT telemetry with small payloads and store-and-forward | Efficient at scale and resilient under intermittent coverage |
| Backend | Cloud-based storage + timeline fusion + alert routing | Centralized monitoring and consistent shipment timeline across multiple evidence streams |

### 13.2 How the design meets the key requirements

| Requirement | Design choice | How it is satisfied |
| --- | --- | --- |
| Near real-time visibility | Periodic GNSS + cellular telemetry (configurable interval) | Default 15 min updates with adaptive reporting; cloud availability typically within minutes when coverage exists |
| Reliability under outages | Store-and-forward + cloud ordering/de-duplication | Data is buffered locally during outages and uploaded later; backend merges delayed bursts into a coherent timeline |
| Security and integrity | Encrypted/authenticated communication + tamper-aware alerts | Trusted device identity, secure transport, and operational workflows for high-severity security events |
| Commercial viability | Composable add-ons + cost model tied to reuse cycles | Only deploy satellite/UWB/tamper features when route/risk justifies cost; reuse and recovery reduce per-shipment cost |

### 13.3 Default configuration

- **Reporting interval (default):** Default ~15 min updates (within the typical 5–30 min range)
- **Connectivity:** NB-IoT primary; LTE-M where mobility/latency requires; satellite only on low-coverage routes
- **Sensors enabled (default):** temperature + motion/impact + tamper/open indicator
- **Offline buffer:** store telemetry locally and upload on reconnection (capacity sized to expected outage durations)
- **Alerting policy (example):** warn if no update is received for ~2 hours; escalate at ~6 hours for high-risk routes (values tuned per route and operating model)

### 13.4 Design conclusion

For high-value logistics, the most practical solution is usually a combination rather than a single technology. Using checkpoint evidence as a baseline, then adding wide-area telemetry and selective add-ons (facility events, satellite fallback, tamper sensing) provides a more robust tracking story without paying the maximum cost on every route and facility.

## AI Usage Statement

This report was prepared with AI assistance for language and structure. All technical content and design choices were reviewed and validated by the authors to ensure correctness and alignment with the course concepts.

## References

- Hologram. (2026, February 2). *10 best IoT asset tracking systems*. Available at: https://www.hologram.io/blog/10-best-iot-asset-tracking-systems
- Silicon Labs. (2023, October 31). *IoT Smart Tracking Streamlines Logistics Management End-to-End*. Available at: https://www.silabs.com/blog/iot-smart-tracking-streamlines-logistics-management
