# Duolingo Clone Architecture

## System Architecture (Frontend + Backend + Database)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '22px'}}}%%
flowchart TB
    %% Top layer: Web App (matches reference style)
    subgraph WEB_APP[Web App]
        FE_AUTH[Authentication<br/>UI]
        FE_LEARN[Learning<br/>UI]
        FE_PROGRESS[Progress and<br/>Gamification UI]
    end

    %% Middle layer: Backend services
    subgraph BACKEND_SERVICES[Backend Services]
        API_GATEWAY[API Gateway<br/>Service]
        AUTH_SERVICE[Authentication<br/>Service]
        LEARNING_SERVICE[Learning<br/>Service]
        PROGRESS_SERVICE[Progress<br/>Service]
        LEADERBOARD_SERVICE[Leaderboard and<br/>Quests Service]
    end

    %% Bottom-left layer: Third-party services
    subgraph THIRD_PARTY[Third-party Services]
        JWT_SERVICE[JWT<br/>Service]
        HASH_SERVICE[Password Hashing<br/>Service]
    end

    %% Bottom-right layer: Databases
    subgraph DATABASES[Databases]
        USER_DB[(User)]
        COURSE_DB[(Course)]
        UNIT_DB[(Unit)]
        LESSON_DB[(Lesson)]
        CHALLENGE_DB[(Challenge)]
        OPTION_DB[(ChallengeOption)]
        PROGRESS_DB[(ChallengeProgress)]
        COUNTER_DB[(Counter)]
    end

    %% Utility box
    subgraph UTILITIES[Utility Layer]
        ID_SEQUENCE[getNextSequence]
        SEED_SCRIPT[Seed Script]
    end

    %% Larger text across nodes and group titles
    classDef nodeText font-size:22px,font-weight:600;
    class FE_AUTH,FE_LEARN,FE_PROGRESS,API_GATEWAY,AUTH_SERVICE,LEARNING_SERVICE,PROGRESS_SERVICE,LEADERBOARD_SERVICE,JWT_SERVICE,HASH_SERVICE,USER_DB,COURSE_DB,UNIT_DB,LESSON_DB,CHALLENGE_DB,OPTION_DB,PROGRESS_DB,COUNTER_DB,ID_SEQUENCE,SEED_SCRIPT nodeText;
    style WEB_APP font-size:24px
    style BACKEND_SERVICES font-size:24px
    style THIRD_PARTY font-size:24px
    style DATABASES font-size:24px
    style UTILITIES font-size:24px

    %% Web app to backend
    FE_AUTH --> API_GATEWAY
    FE_LEARN --> API_GATEWAY
    FE_PROGRESS --> API_GATEWAY

    %% Gateway routing
    API_GATEWAY --> AUTH_SERVICE
    API_GATEWAY --> LEARNING_SERVICE
    API_GATEWAY --> PROGRESS_SERVICE
    API_GATEWAY --> LEADERBOARD_SERVICE

    %% Backend to third-party
    AUTH_SERVICE --> JWT_SERVICE
    AUTH_SERVICE --> HASH_SERVICE

    %% Backend to database
    AUTH_SERVICE --> USER_DB
    LEARNING_SERVICE --> COURSE_DB
    LEARNING_SERVICE --> UNIT_DB
    LEARNING_SERVICE --> LESSON_DB
    LEARNING_SERVICE --> CHALLENGE_DB
    LEARNING_SERVICE --> OPTION_DB
    PROGRESS_SERVICE --> USER_DB
    PROGRESS_SERVICE --> PROGRESS_DB
    PROGRESS_SERVICE --> CHALLENGE_DB
    LEADERBOARD_SERVICE --> USER_DB

    %% Utilities to database
    SEED_SCRIPT --> ID_SEQUENCE
    ID_SEQUENCE --> COUNTER_DB
    SEED_SCRIPT --> USER_DB
    SEED_SCRIPT --> COURSE_DB
    SEED_SCRIPT --> UNIT_DB
    SEED_SCRIPT --> LESSON_DB
    SEED_SCRIPT --> CHALLENGE_DB
    SEED_SCRIPT --> OPTION_DB
    SEED_SCRIPT --> PROGRESS_DB
```

## Runtime Request Flow

```mermaid
sequenceDiagram
	participant U as User (Browser)
	participant FE as React App
	participant API as Express API
	participant AUTH as requireAuth
	participant SRV as appService
	participant DB as MongoDB

	U->>FE: Open protected page (/learn)
	FE->>API: GET /api/app/learn (Bearer JWT)
	API->>AUTH: Validate token and attach req.user
	AUTH-->>API: Authorized user
	API->>SRV: getUserProgress + getCourseProgress + getLessonPercentage + getUnits
	SRV->>DB: Read User/Course/Unit/Lesson/Challenge/ChallengeProgress
	DB-->>SRV: Documents
	SRV-->>API: Aggregated payload
	API-->>FE: JSON response
	FE-->>U: Render learning dashboard
```
