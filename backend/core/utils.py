from core.models import ActivityLog


def log_activity(actor, action, instance=None, notes=None):
    ActivityLog.objects.create(
        actor=actor,
        action=action,
        target_model=instance.__class__.__name__ if instance else "",
        target_id=getattr(instance, "pk", None),
        notes=notes or {},
    )
