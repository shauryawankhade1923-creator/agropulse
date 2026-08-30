import datetime
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from ..models import NotificationLog

class NotificationService:
    """
    Automated Multi-Channel Dispatch Engine for DLT SMS, In-App Live Push, & WhatsApp.
    Simulates real-time telecom & web-socket delivery with audit logging.
    """

    def send_bid_placed_alert(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        buyer_name: str,
        crop_name: str,
        quantity_kg: float,
        offered_rate: float,
        offer_id: int
    ) -> NotificationLog:
        title = f"📩 New Bid Received for {crop_name}"
        total_val = quantity_kg * offered_rate
        whatsapp_msg = (
            f"🌾 *AgroPulse Kisan Mandi Alert*\n\n"
            f"Namaste *{farmer_name}* ji,\n"
            f"Buyer *{buyer_name}* has placed a verified bid for your *{crop_name}* lot!\n\n"
            f"💰 *Offered Rate:* ₹{offered_rate:.2f} / kg\n"
            f"📦 *Quantity:* {quantity_kg:,.0f} kg ({quantity_kg/100:.1f} Quintals)\n"
            f"💵 *Total Deal Value:* ₹{total_val:,.2f}\n\n"
            f"👉 Open AgroPulse to *Accept* or *Counter* this bid instantly.\n"
            f"🔗 Link: https://agropulse.gov.in/bids/{offer_id}"
        )
        # Log WhatsApp
        log_wa = self._log_notification(
            db=db,
            channel="WHATSAPP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="BID_RECEIVED",
            title=title,
            content=whatsapp_msg,
            ref_id=f"BID-{offer_id}"
        )

        # Log DLT SMS
        sms_msg = f"AgroPulse Mandi Alert: New bid from {buyer_name} for {crop_name} ({quantity_kg:,.0f} kg) at Rs.{offered_rate:.2f}/kg. Total: Rs.{total_val:,.2f}. Check portal: agropulse.gov.in"
        self._log_notification(
            db=db,
            channel="SMS",
            phone=farmer_phone,
            name=farmer_name,
            event_type="BID_RECEIVED",
            title=f"📩 SMS: New Bid for {crop_name}",
            content=sms_msg,
            ref_id=f"BID-{offer_id}"
        )

        # Log In-App Push Notification
        app_msg = f"Buyer {buyer_name} offered ₹{offered_rate:.2f}/kg for your {crop_name} lot ({quantity_kg:,.0f} kg). Total ₹{total_val:,.2f}."
        self._log_notification(
            db=db,
            channel="APP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="BID_RECEIVED",
            title=f"New Bid Received: {crop_name}",
            content=app_msg,
            ref_id=f"BID-{offer_id}"
        )

        return log_wa

    def send_bid_accepted_alert(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        buyer_phone: str,
        buyer_name: str,
        crop_name: str,
        quantity_kg: float,
        agreed_rate: float,
        offer_id: int
    ) -> Dict[str, NotificationLog]:
        total_val = quantity_kg * agreed_rate
        
        # 1. Alert to Buyer (WhatsApp & SMS & App)
        buyer_msg = (
            f"🤝 *AgroPulse Trade Confirmation (Deal Locked)*\n\n"
            f"Hello *{buyer_name}*,\n"
            f"Farmer *{farmer_name}* has *ACCEPTED* your procurement offer for *{crop_name}*.\n\n"
            f"🔒 *Locked Rate:* ₹{agreed_rate:.2f} / kg\n"
            f"📦 *Quantity:* {quantity_kg:,.0f} kg\n"
            f"💵 *Procurement Amount:* ₹{total_val:,.2f}\n"
            f"📞 *Farmer Contact:* {farmer_phone}\n\n"
            f"Consignment is ready for Mandi Gate dispatch. View B2B tax invoice on your Buyer Portal."
        )
        log_buyer = self._log_notification(
            db=db,
            channel="WHATSAPP",
            phone=buyer_phone,
            name=buyer_name,
            event_type="BID_ACCEPTED",
            title=f"🤝 Bid Accepted: {crop_name} ({quantity_kg:,.0f} kg)",
            content=buyer_msg,
            ref_id=f"DEAL-{offer_id}"
        )
        self._log_notification(
            db=db,
            channel="APP",
            phone=buyer_phone,
            name=buyer_name,
            event_type="BID_ACCEPTED",
            title=f"🤝 Deal Confirmed: {crop_name}",
            content=f"Farmer {farmer_name} accepted your ₹{agreed_rate:.2f}/kg bid for {quantity_kg:,.0f} kg.",
            ref_id=f"DEAL-{offer_id}"
        )

        # 2. SMS Alert to Farmer
        farmer_sms = (
            f"AgroPulse: Deal confirmed! Your {crop_name} ({quantity_kg:,.0f} kg) is sold to {buyer_name} at Rs.{agreed_rate:.2f}/kg. "
            f"Total: Rs.{total_val:,.2f}. Book your APMC delivery slot now on portal."
        )
        log_farmer = self._log_notification(
            db=db,
            channel="SMS",
            phone=farmer_phone,
            name=farmer_name,
            event_type="BID_ACCEPTED",
            title=f"Deal Confirmed: {crop_name}",
            content=farmer_sms,
            ref_id=f"DEAL-{offer_id}"
        )
        self._log_notification(
            db=db,
            channel="APP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="BID_ACCEPTED",
            title=f"Deal Confirmed: {crop_name}",
            content=f"Sold {quantity_kg:,.0f} kg to {buyer_name} at ₹{agreed_rate:.2f}/kg. Total: ₹{total_val:,.2f}.",
            ref_id=f"DEAL-{offer_id}"
        )

        return {"buyer": log_buyer, "farmer": log_farmer}

    def send_bid_cancelled_alert(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        buyer_phone: str,
        buyer_name: str,
        crop_name: str,
        quantity_kg: float,
        offered_rate: float,
        offer_id: int,
        cancelled_by: str = "FARMER",
        reason: Optional[str] = None
    ) -> Dict[str, NotificationLog]:
        reason_text = f"\n📝 *Reason:* {reason}" if reason else ""

        if cancelled_by == "FARMER":
            buyer_msg = (
                f"🚫 *AgroPulse Bid Status Update (Declined)*\n\n"
                f"Hello *{buyer_name}*,\n"
                f"Farmer *{farmer_name}* has *declined / cancelled* your procurement offer for *{crop_name}*.\n\n"
                f"🌾 *Produce:* {crop_name}\n"
                f"💰 *Bid Rate:* ₹{offered_rate:.2f} / kg\n"
                f"📦 *Volume:* {quantity_kg:,.0f} kg{reason_text}\n\n"
                f"You may submit an updated competitive bid from the AgroPulse Marketplace."
            )
            log_buyer = self._log_notification(
                db=db,
                channel="WHATSAPP",
                phone=buyer_phone,
                name=buyer_name,
                event_type="BID_CANCELLED",
                title=f"🚫 Bid Declined: {crop_name} ({quantity_kg:,.0f} kg)",
                content=buyer_msg,
                ref_id=f"CANCEL-{offer_id}"
            )
            self._log_notification(
                db=db,
                channel="APP",
                phone=buyer_phone,
                name=buyer_name,
                event_type="BID_CANCELLED",
                title=f"Bid Declined: {crop_name}",
                content=f"Farmer {farmer_name} declined your bid of ₹{offered_rate:.2f}/kg.",
                ref_id=f"CANCEL-{offer_id}"
            )

            farmer_msg = (
                f"🚫 *AgroPulse Bid Cancellation Confirmation*\n\n"
                f"Namaste *{farmer_name}* ji,\n"
                f"You have cancelled the bid from *{buyer_name}* for *{crop_name}* (₹{offered_rate:.2f}/kg, {quantity_kg:,.0f} kg).\n"
                f"Your produce lot remains active for other verified APMC buyers."
            )
            log_farmer = self._log_notification(
                db=db,
                channel="WHATSAPP",
                phone=farmer_phone,
                name=farmer_name,
                event_type="BID_CANCELLED",
                title=f"Bid Offer Cancelled: {crop_name}",
                content=farmer_msg,
                ref_id=f"CANCEL-{offer_id}"
            )
            self._log_notification(
                db=db,
                channel="SMS",
                phone=farmer_phone,
                name=farmer_name,
                event_type="BID_CANCELLED",
                title=f"Bid Cancelled: {crop_name}",
                content=f"AgroPulse: Bid from {buyer_name} cancelled. Your {crop_name} lot remains active on market.",
                ref_id=f"CANCEL-{offer_id}"
            )
        else:
            farmer_msg = (
                f"ℹ️ *AgroPulse Bid Withdrawn Notice*\n\n"
                f"Namaste *{farmer_name}* ji,\n"
                f"Buyer *{buyer_name}* has withdrawn their bid on your *{crop_name}* lot.\n\n"
                f"🌾 *Produce:* {crop_name}\n"
                f"💰 *Withdrawn Rate:* ₹{offered_rate:.2f} / kg\n"
                f"📦 *Volume:* {quantity_kg:,.0f} kg\n\n"
                f"Your listing remains open in the APMC Marketplace."
            )
            log_farmer = self._log_notification(
                db=db,
                channel="WHATSAPP",
                phone=farmer_phone,
                name=farmer_name,
                event_type="BID_CANCELLED",
                title=f"Bid Withdrawn: {crop_name}",
                content=farmer_msg,
                ref_id=f"CANCEL-{offer_id}"
            )

            buyer_msg = (
                f"✅ *AgroPulse Bid Retraction Confirmation*\n\n"
                f"Hello *{buyer_name}*,\n"
                f"Your purchase bid of ₹{offered_rate:.2f}/kg for *{crop_name}* has been successfully cancelled."
            )
            log_buyer = self._log_notification(
                db=db,
                channel="WHATSAPP",
                phone=buyer_phone,
                name=buyer_name,
                event_type="BID_CANCELLED",
                title=f"Bid Cancelled: {crop_name}",
                content=buyer_msg,
                ref_id=f"CANCEL-{offer_id}"
            )

        return {"buyer": log_buyer, "farmer": log_farmer}

    def send_token_qr_delivery(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        token_number: str,
        crop_name: str,
        center_name: str,
        slot_date: str,
        slot_time: str,
        assigned_counter: int,
        estimated_wait_mins: float
    ) -> NotificationLog:
        title = f"🎟️ Mandi E-Pass & QR Token: {token_number}"
        whatsapp_msg = (
            f"🎟️ *AgroPulse Electronic Mandi Pass & QR Token*\n\n"
            f"Namaste *{farmer_name}* ji,\n"
            f"Your procurement slot appointment has been confirmed!\n\n"
            f"🏷️ *Token Number:* `{token_number}`\n"
            f"🏛️ *Mandi Center:* {center_name}\n"
            f"📅 *Arrival Date:* {slot_date}\n"
            f"⏰ *Time Slot:* {slot_time}\n"
            f"🏬 *Assigned Weighbridge:* Counter #{assigned_counter}\n"
            f"⏳ *AI Wait Time Estimate:* ~{int(estimated_wait_mins)} mins\n\n"
            f"📲 *Scan & Go QR Pass:* Show this token or scan your QR at the APMC entrance gate camera for fast-track entry.\n"
            f"🔗 E-Pass Link: https://agropulse.gov.in/token/{token_number}"
        )
        log_wa = self._log_notification(
            db=db,
            channel="WHATSAPP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="TOKEN_ISSUED",
            title=title,
            content=whatsapp_msg,
            ref_id=token_number
        )

        # DLT SMS
        sms_msg = f"AgroPulse E-Pass: Token {token_number} confirmed for {slot_date} ({slot_time}) at {center_name}. Counter #{assigned_counter}. Show QR at gate."
        self._log_notification(
            db=db,
            channel="SMS",
            phone=farmer_phone,
            name=farmer_name,
            event_type="TOKEN_ISSUED",
            title=f"🎟️ SMS: Mandi Token {token_number}",
            content=sms_msg,
            ref_id=token_number
        )

        # In-App Notification
        self._log_notification(
            db=db,
            channel="APP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="TOKEN_ISSUED",
            title=f"E-Pass Booked: {token_number}",
            content=f"Assigned to Weighbridge Counter #{assigned_counter}. Estimated wait time ~{int(estimated_wait_mins)} mins.",
            ref_id=token_number
        )

        return log_wa

    def send_token_cancelled_alert(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        token_number: str,
        crop_name: str,
        center_name: str,
        slot_time: str
    ) -> NotificationLog:
        title = f"🚫 Token Pass Cancelled: {token_number}"
        whatsapp_msg = (
            f"🚫 *AgroPulse Mandi Pass Cancellation*\n\n"
            f"Namaste *{farmer_name}* ji,\n"
            f"Your APMC Procurement Pass *`{token_number}`* for *{crop_name}* at *{center_name}* ({slot_time}) has been *CANCELLED*.\n\n"
            f"🌾 Your produce lot has been released back to active marketplace listing.\n"
            f"You may book a fresh procurement window anytime from the Farmer Dashboard."
        )
        return self._log_notification(
            db=db,
            channel="WHATSAPP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="TOKEN_CANCELLED",
            title=title,
            content=whatsapp_msg,
            ref_id=f"CANCEL-{token_number}"
        )

    def send_queue_gate_alert(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        token_number: str,
        counter_num: int,
        queue_pos: int,
        estimated_wait_mins: float
    ) -> NotificationLog:
        title = f"⏱️ Gate Checked-in: Token {token_number}"
        sms_msg = (
            f"AgroPulse Gate Entry: Token {token_number} verified. "
            f"Assigned to Counter #{counter_num}. Your queue position is #{queue_pos}. "
            f"Estimated inspection time: ~{int(estimated_wait_mins)} mins. Please proceed to inspection bay."
        )
        log_sms = self._log_notification(
            db=db,
            channel="SMS",
            phone=farmer_phone,
            name=farmer_name,
            event_type="QUEUE_ALERT",
            title=title,
            content=sms_msg,
            ref_id=token_number
        )

        # In-App Push
        self._log_notification(
            db=db,
            channel="APP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="QUEUE_ALERT",
            title=f"⏱️ Counter #{counter_num} Ready (Pos #{queue_pos})",
            content=f"Token {token_number} checked in. Proceed to bay ~{int(estimated_wait_mins)}m wait.",
            ref_id=token_number
        )

        return log_sms

    def send_dbt_payout_voucher(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        token_number: str,
        crop_name: str,
        weight_kg: float,
        grade: str,
        net_payable: float,
        utr_number: str,
        bank_masked: str
    ) -> NotificationLog:
        title = f"💰 Instant DBT Payment Disbursed: ₹{net_payable:,.2f}"
        whatsapp_msg = (
            f"✅ *Government APMC Mandi Settlement & DBT Receipt*\n\n"
            f"Namaste *{farmer_name}* ji,\n"
            f"Your crop inspection & weighing is COMPLETE and Direct Bank DBT has been disbursed!\n\n"
            f"🌾 *Produce:* {crop_name} (Grade {grade})\n"
            f"⚖️ *Certified Net Weight:* {weight_kg:,.1f} kg\n"
            f"💰 *Net Payable Disbursed:* *₹{net_payable:,.2f}*\n"
            f"🏦 *Transferred To:* {bank_masked}\n"
            f"🆔 *Banking UTR / Ref:* `{utr_number}`\n"
            f"📜 *Digital Certificate:* Verified by Mandi Quality Officer\n\n"
            f"Thank you for transacting on AgroPulse APMC Portal."
        )
        log_wa = self._log_notification(
            db=db,
            channel="WHATSAPP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="PAYMENT_SETTLED",
            title=title,
            content=whatsapp_msg,
            ref_id=utr_number
        )

        # DLT SMS
        sms_msg = f"AgroPulse DBT: Rs.{net_payable:,.2f} credited to {bank_masked} via UTR {utr_number} for {crop_name} ({weight_kg:,.1f} kg, Grade {grade}). APMC Mandi settlement done."
        self._log_notification(
            db=db,
            channel="SMS",
            phone=farmer_phone,
            name=farmer_name,
            event_type="PAYMENT_SETTLED",
            title=f"💰 SMS: DBT Disbursed ₹{net_payable:,.2f}",
            content=sms_msg,
            ref_id=utr_number
        )

        # In-App Push
        self._log_notification(
            db=db,
            channel="APP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="PAYMENT_SETTLED",
            title=f"💰 Payment Received: ₹{net_payable:,.2f}",
            content=f"DBT transfer completed to {bank_masked}. Ref: {utr_number}.",
            ref_id=utr_number
        )

        return log_wa

    def send_freight_booking_slip(
        self,
        db: Session,
        farmer_phone: str,
        farmer_name: str,
        consignment_code: str,
        driver_name: str,
        driver_phone: str,
        vehicle_type: str,
        vehicle_number: str,
        pickup_location: str,
        pickup_time: str,
        pooled_fare: float,
        saved_amount: float
    ) -> NotificationLog:
        title = f"🚚 Shared Freight Confirmed: {consignment_code}"
        whatsapp_msg = (
            f"🚚 *AgroPulse Kisan Smart Freight Pass*\n\n"
            f"Namaste *{farmer_name}* ji,\n"
            f"Your shared pickup transport has been reserved successfully!\n\n"
            f"📦 *Consignment Code:* `{consignment_code}`\n"
            f"👤 *Driver Name:* {driver_name}\n"
            f"📞 *Driver Phone:* {driver_phone}\n"
            f"🚛 *Vehicle:* {vehicle_type} (`{vehicle_number}`)\n"
            f"📍 *Pickup Point:* {pickup_location}\n"
            f"⏰ *Pickup Time:* {pickup_time}\n"
            f"💵 *Your Shared Fare:* ₹{pooled_fare:,.2f}\n"
            f"🎉 *Net Savings:* ₹{saved_amount:,.2f} vs Solo Truck Hire\n\n"
            f"Driver will call you 15 minutes before arrival at your farmgate."
        )
        log_wa = self._log_notification(
            db=db,
            channel="WHATSAPP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="FREIGHT_BOOKED",
            title=title,
            content=whatsapp_msg,
            ref_id=consignment_code
        )

        # DLT SMS
        sms_msg = f"AgroPulse Freight: Pickup booked for {pickup_time} at {pickup_location}. Driver: {driver_name} ({driver_phone}), Veh: {vehicle_number}. Fare: Rs.{pooled_fare:,.2f}."
        self._log_notification(
            db=db,
            channel="SMS",
            phone=farmer_phone,
            name=farmer_name,
            event_type="FREIGHT_BOOKED",
            title=f"🚚 SMS: Shared Freight {consignment_code}",
            content=sms_msg,
            ref_id=consignment_code
        )

        # In-App Push
        self._log_notification(
            db=db,
            channel="APP",
            phone=farmer_phone,
            name=farmer_name,
            event_type="FREIGHT_BOOKED",
            title=f"🚚 Smart Freight Reserved",
            content=f"Pickup at {pickup_time}. Driver {driver_name} ({driver_phone}). Saved ₹{saved_amount:,.2f}!",
            ref_id=consignment_code
        )

        return log_wa

    def send_direct_sms(
        self,
        db: Session,
        phone: str,
        name: Optional[str] = "Farmer",
        template_type: str = "BID_ALERT",
        message_text: Optional[str] = None,
        ref_id: Optional[str] = None
    ) -> NotificationLog:
        """
        Dispatches a DLT-compliant instant SMS alert to mobile number.
        """
        if not message_text:
            if template_type == "DEAL_LOCKED":
                message_text = "AgroPulse Alert: Your trade deal has been confirmed and locked. Please proceed to APMC Mandi gate for weighment."
                title = "🤝 SMS: Deal Confirmed"
            elif template_type == "TOKEN_PASS":
                token_no = ref_id or "AP-2026-9901"
                message_text = f"AgroPulse E-Pass: Token {token_no} confirmed. Assigned to Counter #2. Show QR pass at APMC gate for express entry."
                title = f"🎟️ SMS: Mandi Token {token_no}"
            elif template_type == "GATE_ENTRY":
                message_text = "AgroPulse Mandi: Gate check-in complete. Please proceed to Weighbridge Counter #2 for sample quality assay."
                title = "⏱️ SMS: Gate Check-in"
            elif template_type == "DBT_PAYOUT":
                message_text = "AgroPulse Govt DBT: ₹42,500.00 transferred directly to your bank account via UTR20260831. Settlement complete."
                title = "💰 SMS: Instant DBT Payout"
            elif template_type == "FREIGHT_SLIP":
                message_text = "AgroPulse Freight: Shared pickup reserved. Driver Suresh (+91 9822019283) will arrive at 06:30 AM at your farmgate."
                title = "🚚 SMS: Freight Pickup Reserved"
            else:
                message_text = "AgroPulse Mandi: Live market price update for Nashik APMC. Onion FAQ Grade A trading at ₹26.50/kg today."
                title = "🌾 SMS: Mandi Market Alert"
        else:
            title = f"📱 SMS Alert: {template_type}"

        return self._log_notification(
            db=db,
            channel="SMS",
            phone=phone,
            name=name,
            event_type=template_type,
            title=title,
            content=message_text,
            ref_id=ref_id or f"SMS-{datetime.datetime.utcnow().strftime('%H%M%S')}"
        )

    def send_app_notification(
        self,
        db: Session,
        phone: str,
        name: Optional[str] = "Farmer",
        event_type: str = "SYSTEM_ALERT",
        title: str = "AgroPulse Alert",
        content: str = "You have a new update in your Mandi workspace.",
        ref_id: Optional[str] = None
    ) -> NotificationLog:
        """
        Creates an In-App Live Push Notification.
        """
        return self._log_notification(
            db=db,
            channel="APP",
            phone=phone,
            name=name,
            event_type=event_type,
            title=title,
            content=content,
            ref_id=ref_id or f"APP-{datetime.datetime.utcnow().strftime('%H%M%S')}"
        )

    def _dispatch_via_fast2sms(self, phone: str, content: str):
        """
        Dispatches real instant SMS to Indian mobile numbers via Fast2SMS API.
        """
        from ..config import settings
        if not settings.FAST2SMS_API_KEY:
            return None
        try:
            import urllib.request
            import urllib.error
            import json

            # Extract 10-digit Indian mobile number
            clean_digits = "".join(filter(str.isdigit, phone))
            if len(clean_digits) > 10:
                clean_digits = clean_digits[-10:]

            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = {
                "route": "q",
                "message": content,
                "language": "english",
                "flash": 0,
                "numbers": clean_digits
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={
                    "authorization": settings.FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = response.read().decode("utf-8")
                    print(f"[Fast2SMS Real SMS Dispatched to {clean_digits}]:", res_body)
                    return json.loads(res_body)
            except urllib.error.HTTPError as http_err:
                err_resp = http_err.read().decode("utf-8")
                print(f"[Fast2SMS API Response Notice] {http_err.code}: {err_resp}")
                return json.loads(err_resp) if err_resp else None
        except Exception as e:
            print(f"[Fast2SMS Error] Failed to send SMS to {phone}:", e)
            return None

    def _dispatch_via_twilio(self, phone: str, content: str, channel: str = "WHATSAPP"):
        from ..config import settings
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            return None
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            clean_digits = "".join(filter(str.isdigit, phone))
            if len(clean_digits) == 10:
                clean_phone = f"+91{clean_digits}"
            elif not str(phone).startswith("+"):
                clean_phone = f"+{clean_digits}"
            else:
                clean_phone = phone

            to_number = f"whatsapp:{clean_phone}" if channel.upper() == "WHATSAPP" else clean_phone
            from_number = settings.TWILIO_WHATSAPP_NUMBER if channel.upper() == "WHATSAPP" else (settings.TWILIO_PHONE_NUMBER or settings.TWILIO_WHATSAPP_NUMBER)

            msg = client.messages.create(
                body=content,
                from_=from_number,
                to=to_number
            )
            print(f"[Twilio {channel} Dispatched] SID: {msg.sid} to {to_number}")
            return msg.sid
        except Exception as e:
            print(f"[Twilio {channel} Error] Failed to send to {phone}:", e)
            return None

    def _log_notification(
        self,
        db: Session,
        channel: str,
        phone: str,
        name: Optional[str],
        event_type: str,
        title: str,
        content: str,
        ref_id: Optional[str] = None
    ) -> NotificationLog:
        # 1. Live background dispatch via Fast2SMS if SMS channel
        if channel.upper() == "SMS":
            self._dispatch_via_fast2sms(phone=phone, content=content)

        # 2. Live background dispatch via Twilio (WhatsApp or SMS fallback)
        if channel.upper() in ["WHATSAPP", "SMS"]:
            self._dispatch_via_twilio(phone=phone, content=content, channel=channel)

        log = NotificationLog(
            channel=channel.upper(),
            recipient_phone=phone,
            recipient_name=name or "Farmer",
            event_type=event_type,
            title=title,
            message_content=content,
            status="DELIVERED",
            is_read=False,
            reference_id=ref_id,
            created_at=datetime.datetime.utcnow()
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

notification_service = NotificationService()

