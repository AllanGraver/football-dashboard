# BetScope dashboard til GitHub Pages

## Upload
1. Pak ZIP-filen ud og upload mapperne og filerne til roden af et GitHub repository.
2. Under Settings > Secrets and variables > Actions oprettes secret `APIFY_TOKEN`.
3. Opret repository variable `APIFY_ACTOR_ID` med ID'et på din datakilde.
4. Under Settings > Pages vælges `GitHub Actions` som Source.
5. Åbn Actions > Opdater dashboard > Run workflow.

Dashboardet viser KPI-kort, søgning, niveaufilter, en rangeret top 10 og udfoldelig analyse for alle fem kriterier. Data opdateres af workflowet. Knappen på siden genindlæser senest publicerede data.

Datakilden skal returnere dagens kampe, hvert holds historik og H2H. Hvis dens feltnavne afviger, tilpasses mappingen i `src/engine.js`.
