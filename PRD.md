# PRD — C1: Multi-Instance Chat

## 1. Project Overview

### 1.1 Objective

Build a real-time chat application that runs as three identical backend instances behind a load balancer and behaves as if it were a single server.

Users must be able to exchange messages, view presence and typing indicators, and reconnect after failures regardless of which instance they are connected to.

### 1.2 Build Time

18–22 days.

### 1.3 Technology Stack

The technology stack is the student's choice.

Suggested components:

- **Backend:** Node.js + TypeScript
- **Real-time communication:** WebSocket or Socket.IO
- **Shared store or broker:** Redis
- **Persistent storage:** PostgreSQL or another suitable database
- **Load balancer:** Nginx
- **Logging:** Pino
- **Testing:** Automated integration tests and load testing

The suggested technologies are implementation choices, not mandatory requirements.

---

## 2. Problem Statement

A chat application running on multiple server instances cannot rely solely on in-memory state.

For example, if User A connects to Instance 1 and User B connects to Instance 3, they must still be able to exchange messages and see each other's presence and typing status.

The application must also handle disconnections, instance crashes, client retries, and reconnections without losing messages or creating duplicates.

---

## 3. Goals

1. Support real-time messaging across different server instances.
2. Maintain consistent online presence and typing indicators across instances.
3. Deliver stored messages when offline users reconnect.
4. Prevent duplicate message delivery caused by client retries.
5. Allow users connected to a restarted instance to reconnect elsewhere without missing messages.
6. Collect per-instance operational metrics.
7. Demonstrate the required connection capacity, throughput, latency, and recovery time.

## 4. Non-Goals

The following are not explicit core requirements in the supplied C1 brief and are outside the initial scope unless added later:

- Video and voice calls
- Group calls and screen sharing
- File and media sharing
- End-to-end encryption
- Push notifications
- A complete identity platform
- Advanced moderation and administration dashboards

Basic authentication may be added as a supporting feature, but the supplied brief does not explicitly require a login or registration system.

---

## 5. Core Functional Requirements

### FR-1: Real-Time Messaging

- Users must be able to send and receive messages in real time.
- Messages must be delivered regardless of which instance each user is connected to.
- The system must support communication between users connected to different instances.
- Each message should have a unique identifier to support duplicate prevention.

### FR-2: Cross-Instance Communication

- The application must run as three identical backend instances.
- Instances must coordinate message delivery through a shared store, broker, or another suitable mechanism.
- A message sent through one instance must reach its intended recipient even if the recipient is connected to another instance.
- The application must behave as a unified chat service rather than three isolated servers.

### FR-3: Shared Presence

- Users must be able to see whether other users are online or offline.
- Presence information must be consistent across all instances.
- If an instance crashes, its connected users must appear offline within 30 seconds.
- Stale presence entries must expire rather than remain indefinitely.

### FR-4: Shared Typing Indicators

- Users must be able to see when another user is typing.
- Typing indicators must work across instances.
- Typing state must be cleared when the user stops typing, disconnects, or becomes unavailable.
- Temporary typing state must not persist indefinitely after a failure.

### FR-5: Offline Message Delivery

- Messages intended for offline users must be stored for later delivery.
- When an offline user reconnects, stored messages must be delivered.
- Messages must remain available when a server instance restarts.
- Message persistence must not depend solely on an instance's in-memory state.

### FR-6: Retry and Duplicate Prevention

- Clients may retry sending a message after a network failure or timeout.
- Retrying the same message must not create duplicate messages.
- The system must identify repeated submissions using a stable message ID or idempotency key.
- A repeated request must not create another logical message.

### FR-7: Reconnection and Recovery

- Users disconnected by an instance restart must be able to reconnect through another available instance.
- Reconnecting users must not miss messages that should have been delivered to them.
- The application must recover from an instance restart within the required demonstration target.
- Recovery behavior must be tested rather than assumed.

### FR-8: Per-Instance Metrics

The system must expose or record metrics for each instance, including:

- Active connections
- Messages processed per second
- Message delivery latency

Metrics should make it possible to distinguish the behavior of individual instances during load tests and failure scenarios.

---

## 6. Key User Scenarios

### Scenario 1: Cross-Instance Messaging

**Given:** User A is connected to Instance 1 and User B is connected to Instance 3.

**When:** User A sends a message to User B.

**Then:**

- The message reaches User B.
- The message is not dependent on both users sharing the same instance.
- Delivery latency is measured.

### Scenario 2: Shared Presence and Typing

**Given:** Two users are connected to different instances.

**When:** One user comes online or starts typing.

**Then:**

- The other user sees the correct presence and typing state.
- The state is updated across instances.

### Scenario 3: Instance Crash

**Given:** Users are connected to Instance 3.

**When:** Instance 3 crashes or restarts.

**Then:**

- Its users appear offline within 30 seconds.
- Users can reconnect through another available instance.
- They receive messages they missed while disconnected.
- Recovery completes within the required demonstration target of 10 seconds.

### Scenario 4: Client Retries

**Given:** A client sends a message but does not receive an acknowledgement.

**When:** The client retries the same message three times.

**Then:**

- The system recognizes the repeated submissions.
- Exactly one logical message is created and delivered.
- The sender does not create duplicate messages through retries.

### Scenario 5: Offline Recipient

**Given:** A recipient is offline.

**When:** Another user sends a message to that recipient.

**Then:**

- The message is stored persistently.
- The recipient reconnects.
- The stored message is delivered.

---

## 7. Non-Functional Requirements

### NFR-1: Scalability

The application must support 500–1,000 simultaneous connections across three instances.

### NFR-2: Throughput

The application must sustain 50–100 messages per second for five minutes during the demonstration.

### NFR-3: Latency

Cross-instance message delivery must achieve a p95 latency below 500 milliseconds.

### NFR-4: Availability and Recovery

The application must recover after an instance restart in under 10 seconds for the demonstration scenario.

### NFR-5: Presence Accuracy

When an instance crashes, its users must be marked offline within 30 seconds.

### NFR-6: Reliability

- Client retries must not create duplicate logical messages.
- Offline messages must survive instance restarts.
- Reconnecting users must receive messages they missed.

---

## 8. Acceptance Criteria

The project is considered to meet its primary requirements when the following checks pass.

| ID    | Acceptance criterion                                                       |
| ----- | -------------------------------------------------------------------------- |
| AC-1  | Three identical instances run behind a load balancer.                      |
| AC-2  | Users connected to different instances can exchange messages.              |
| AC-3  | Presence and typing indicators work across instances.                      |
| AC-4  | Users of a crashed instance appear offline within 30 seconds.              |
| AC-5  | Offline messages are delivered after reconnection.                         |
| AC-6  | Retrying the same message three times creates exactly one logical message. |
| AC-7  | Users can reconnect after an instance restart without missing messages.    |
| AC-8  | Per-instance connections, throughput, and delivery latency are measured.   |
| AC-9  | The system supports 500–1,000 connections across three instances.          |
| AC-10 | The system sustains 50–100 messages per second for five minutes.           |
| AC-11 | Cross-instance delivery p95 latency is below 500 ms.                       |
| AC-12 | Recovery after an instance restart is under 10 seconds.                    |

---

## 9. Architecture Decision Records (ADRs)

The following design questions must be investigated and documented.

### ADR-001: Cross-Instance Routing

**Question:** Should the application use pub/sub, a message broker, or routing through a connection registry?

Evaluate:

- Delivery behavior
- Reliability
- Complexity
- Operational overhead
- Suitability for three instances

### ADR-002: Presence Storage and Expiry

**Question:** Where does presence live, and how do stale entries expire?

Evaluate:

- Shared state
- Heartbeats or leases
- Expiration behavior
- Crash detection
- Race conditions during reconnects

### ADR-003: Load Balancer Sessions

**Question:** Should the load balancer use sticky sessions?

Evaluate:

- WebSocket connection behavior
- Reconnection handling
- Failure recovery
- Whether sticky sessions are necessary for the chosen architecture

### ADR-004: Reconnection and Missed Messages

**Question:** How do a reconnecting client and the server agree on what messages were missed?

Evaluate:

- Message IDs and sequence numbers
- Last acknowledged message
- Replay of missed messages
- Duplicate suppression
- Persistence and acknowledgement behavior

---

## 10. Suggested Data Model

This is a proposed starting point, not a schema mandated by the project brief.

### User

- `id`
- `username`
- `created_at`

### Message

- `id`
- `sender_id`
- `recipient_id`
- `content`
- `created_at`

### Message Delivery State

- `message_id`
- `recipient_id`
- `delivered_at`
- `acknowledged_at`

### Presence

- `user_id`
- `instance_id`
- `last_seen`
- `expires_at`

The database and shared-store schemas should be finalized in `DESIGN.md` after deciding the routing and persistence approach.

---

## 11. Observability and Error Handling

The application should:

- Log connection and disconnection events.
- Log message processing and delivery failures.
- Record instance identifiers in relevant logs.
- Measure message throughput and delivery latency.
- Record restart and recovery events.
- Handle Redis or database connection failures explicitly.
- Avoid logging passwords, tokens, or sensitive message content unnecessarily.

Use `ERRORS.md` to document significant bugs, their causes, fixes, and prevention strategies.

---

## 12. Testing Strategy

### Unit Tests

- Message ID and duplicate detection
- Message validation
- Presence expiry logic
- Typing state cleanup

### Integration Tests

- Cross-instance message delivery
- Shared presence and typing
- Offline message persistence
- Retry and duplicate prevention
- Reconnection and missed-message replay

### Failure Tests

- Kill one instance while users are connected.
- Restart an instance.
- Disconnect Redis or the database temporarily.
- Reconnect clients after network failures.
- Verify that stale presence entries expire.

### Load Tests

- Test 500–1,000 simultaneous connections.
- Sustain 50–100 messages per second for five minutes.
- Measure p95 cross-instance delivery latency.
- Measure recovery after an instance restart.
- Capture metrics for each instance.

---

## 13. Deliverables

- [ ] Three-instance chat backend
- [ ] Load balancer configuration
- [ ] Shared cross-instance routing and presence
- [ ] Typing indicators
- [ ] Persistent offline message delivery
- [ ] Retry handling and duplicate prevention
- [ ] Reconnection and recovery behavior
- [ ] Per-instance metrics
- [ ] Automated tests
- [ ] Load-test report
- [ ] `README.md` — setup and usage
- [ ] `CONCEPTS.md` — concepts learned and applied
- [ ] `DESIGN.md` — architecture and data flow
- [ ] `ADR/` — architecture decision records
- [ ] `API.md` — HTTP and WebSocket event contracts
- [ ] `ERRORS.md` — significant errors and resolutions

---

## 14. Definition of Done

The project is complete when the three-instance system demonstrates the required functionality, reliability, and performance targets, and the architecture decisions and testing evidence are documented.

The key demonstration is that users connected to different instances can communicate as if they were using one server, while instance failures, reconnections, offline delivery, and client retries are handled correctly.
