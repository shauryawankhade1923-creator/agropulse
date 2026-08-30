from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ..database import get_db
from ..models import NotificationLog
from ..schemas import NotificationLogOut, SendNotificationRequest, SendSMSRequest, MarkNotificationReadRequest
from ..services.notification_service import notification_service

router = APIRouter(prefix="/notifications", tags=["SMS & App Notification Automation"])

@router.get("/logs", response_model=List[NotificationLogOut])
def get_notification_logs(
    channel: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(NotificationLog)
    if channel and channel.upper() != "ALL":
        query = query.filter(NotificationLog.channel == channel.upper())
    logs = query.order_by(NotificationLog.created_at.desc()).limit(limit).all()
    return logs

@router.get("/user/{phone}", response_model=List[NotificationLogOut])
def get_user_notifications(phone: str, channel: Optional[str] = None, db: Session = Depends(get_db)):
    clean_phone = phone.replace("+91", "").strip()
    query = db.query(NotificationLog).filter(
        NotificationLog.recipient_phone.contains(clean_phone)
    )
    if channel and channel.upper() != "ALL":
        query = query.filter(NotificationLog.channel == channel.upper())
    logs = query.order_by(NotificationLog.created_at.desc()).all()
    return logs

@router.get("/unread-count")
def get_unread_count(phone: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(NotificationLog).filter(NotificationLog.is_read == False)
    if phone:
        clean_phone = phone.replace("+91", "").strip()
        query = query.filter(NotificationLog.recipient_phone.contains(clean_phone))
    count = query.count()
    return {"unread_count": count}

@router.post("/send-sms", response_model=NotificationLogOut)
def send_sms_alert(req: SendSMSRequest, db: Session = Depends(get_db)):
    """
    Dispatches a DLT-compliant instant SMS alert.
    """
    log = notification_service.send_direct_sms(
        db=db,
        phone=req.recipient_phone,
        name=req.recipient_name,
        template_type=req.template_type,
        message_text=req.message_text,
        ref_id=req.reference_id
    )
    return log

@router.post("/send-app", response_model=NotificationLogOut)
def send_app_alert(req: SendNotificationRequest, db: Session = Depends(get_db)):
    """
    Dispatches an In-App Push Notification.
    """
    log = notification_service.send_app_notification(
        db=db,
        phone=req.recipient_phone,
        name=req.recipient_name,
        event_type=req.event_type,
        title=req.title,
        content=req.message_content,
        ref_id=req.reference_id
    )
    return log

@router.post("/send-custom", response_model=NotificationLogOut)
def send_custom_notification(req: SendNotificationRequest, db: Session = Depends(get_db)):
    log = notification_service._log_notification(
        db=db,
        channel=req.channel,
        phone=req.recipient_phone,
        name=req.recipient_name,
        event_type=req.event_type,
        title=req.title,
        content=req.message_content,
        ref_id=req.reference_id
    )
    return log

@router.post("/mark-read")
def mark_notification_read(req: MarkNotificationReadRequest, db: Session = Depends(get_db)):
    if req.mark_all:
        query = db.query(NotificationLog)
        if req.phone:
            clean = req.phone.replace("+91", "").strip()
            query = query.filter(NotificationLog.recipient_phone.contains(clean))
        query.update({NotificationLog.is_read: True}, synchronize_session=False)
        db.commit()
        return {"status": "success", "message": "All notifications marked as read"}
    elif req.notification_id:
        notif = db.query(NotificationLog).filter(NotificationLog.id == req.notification_id).first()
        if notif:
            notif.is_read = True
            db.commit()
            return {"status": "success", "message": f"Notification {req.notification_id} marked as read"}
    return {"status": "ok"}
