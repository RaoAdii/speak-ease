# Duolingo Clone ER Diagram

## Mermaid ER Diagram (Photo Style)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '32px'}}}%%
flowchart LR
    %% Compact Chen-style ERD matching the reference look
    C["Course<br/> "]
    U["Unit<br/> "]
    L["Lesson<br/> "]
    CH["Challenge<br/> "]
    O["ChallengeOption<br/> "]
    US["User<br/> "]
    CP["ChallengeProgress<br/> "]
    CT["Counter<br/> "]

    R1{"Has<br/>"}
    R2{"Has<br/>"}
    R3{"Has<br/>"}
    R4{"Has<br/>"}
    R5{"Records<br/>"}
    R6{"Tracks<br/>"}
    R7{"ActiveIn<br/>"}
    R8{"GeneratesId<br/>"}

    C -->|1| R1 -->|N| U
    U -->|1| R2 -->|N| L
    L -->|1| R3 -->|N| CH
    CH -->|1| R4 -->|N| O

    US -->|1| R5 -->|N| CP
    CH -->|1| R6 -->|N| CP
    C -->|1| R7 -->|0..N| US

    CT -->|1| R8 -->|N| C
    R8 -->|N| U
    R8 -->|N| L
    R8 -->|N| CH
    R8 -->|N| O

    %% Grouped attributes (single oval per entity for compactness)
    AC(( id UK, title, imageSrc )) --- C
    AU(( id UK, courseId FK, title, order )) --- U
    AL(( id UK, unitId FK, title, order )) --- L
    ACH(( id UK, lessonId FK, type, question )) --- CH
    AO(( id UK, challengeId FK, text, correct )) --- O
    AUS(( email UK, activeCourseId FK, hearts, points )) --- US
    ACP(( userId FK, challengeId FK, completed, unique pair )) --- CP
    ACT(( key UK, value )) --- CT

    classDef entity fill:#d89c3a,stroke:#8a6a1f,color:#111,stroke-width:2px,font-size:32px,font-weight:bold;
    classDef relation fill:#74251f,stroke:#4e1613,color:#fff,stroke-width:2px,font-size:32px,font-weight:bold;
    classDef attribute fill:#1d5a63,stroke:#103840,color:#fff,stroke-width:2px,font-size:28px;

    class C,U,L,CH,O,US,CP,CT entity;
    class R1,R2,R3,R4,R5,R6,R7,R8 relation;
    class AC,AU,AL,ACH,AO,AUS,ACP,ACT attribute;
```
