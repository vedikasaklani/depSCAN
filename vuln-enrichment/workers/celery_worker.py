from celery import Celery
from services.enricher import enrich_component

app = Celery(
    "sbom",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@app.task
def enrich_component_task(component):
    return enrich_component(component)