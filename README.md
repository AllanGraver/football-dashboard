# BetScope dashboard til GitHub Pages

## Upload
1. Pak ZIP-filen ud og upload mapperne og filerne til roden af et GitHub repository.
2. Opret en gratis API-nøgle på [Football-Data.org](https://www.football-data.org/) og gem den som secret `FOOTBALL_DATA_API_KEY` under Settings > Secrets and variables > Actions.
3. Valgfrit: Angiv `FOOTBALL_DATA_COMPETITIONS` som en kommasepareret liste, for eksempel `PL,BL1,SA`.
4. Under Settings > Pages vælges `GitHub Actions` som Source.
5. Åbn Actions > Opdater dashboard > Run workflow.

Dashboardet viser KPI-kort, søgning, niveaufilter, en rangeret top 10 og udfoldelig analyse for alle fem kriterier. Data opdateres af workflowet. Knappen på siden genindlæser senest publicerede data.

Workflowet henter kampe fra Football-Data.org v4 og bygger holdhistorik og H2H fra de seneste 365 dage. Det henter som standard Premier League (`PL`), Bundesliga (`BL1`), Eredivisie (`DED`), Jupiler League (`BJL`), Eliteserien (`ELI`), Allsvenskan (`AL1`) og Superligaen (`DK1`).
