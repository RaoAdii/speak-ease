# MVC PATTERN

~~~mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '20px'}}}%%
flowchart TB
	DB([DATABASE])
	M[MODEL]
	V[VIEW]
	C[CONTROLLER]
	U([USER])

	N1[Has Files<br/>- server/src/models<br/>- server/src/services]
	N2[Routes<br/>- server/src/routes<br/>- client/src/App.tsx]

	DB <-->|DB Operations| M
	M <-->|Business/Data Calls| C
	V -->|Route and API Calls| C

	U -->|Request| C
	C -->|Response| U

	N1 --- M
	N2 --- V

	classDef database fill:#c9c9c9,stroke:#a6a6a6,color:#111,stroke-width:1.8px,font-size:22px,font-weight:700;
	classDef model fill:#efe3b9,stroke:#c7b67a,color:#111,stroke-width:1.8px,font-size:22px,font-weight:700;
	classDef view fill:#f0c9c6,stroke:#d59f9a,color:#111,stroke-width:1.8px,font-size:22px,font-weight:700;
	classDef controller fill:#a8c1e8,stroke:#7e9fcb,color:#111,stroke-width:1.8px,font-size:22px,font-weight:700;
	classDef user fill:#07906d,stroke:#05694f,color:#fff,stroke-width:1.8px,font-size:22px,font-weight:700;
	classDef note fill:transparent,stroke:transparent,color:#111,font-size:16px;

	class DB database;
	class M model;
	class V view;
	class C controller;
	class U user;
	class N1,N2 note;

	linkStyle 0 stroke:#868686,stroke-width:3px;
	linkStyle 1 stroke:#868686,stroke-width:3px;
	linkStyle 2 stroke:#868686,stroke-width:3px;
	linkStyle 3 stroke:#868686,stroke-width:3px;
	linkStyle 4 stroke:#868686,stroke-width:3px;
~~~
