package com.example.school.service;

import com.example.school.config.WhatsAppConfig;
import com.example.school.model.Notification;
import com.example.school.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WhatsAppService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);

    private final WhatsAppConfig whatsAppConfig;
    private final NotificationRepository notificationRepository;
    private final RestClient restClient;

    @Autowired
    public WhatsAppService(WhatsAppConfig whatsAppConfig,
                           NotificationRepository notificationRepository,
                           RestClient whatsAppRestClient) {
        this.whatsAppConfig = whatsAppConfig;
        this.notificationRepository = notificationRepository;
        this.restClient = whatsAppRestClient;
    }

    /**
     * Sends an automated WhatsApp notification to a parent when a student is marked ABSENT.
     * Uses Meta WhatsApp Cloud API Template format.
     */
    public Notification sendAbsentNotification(Long studentId, String studentName, String parentPhone, LocalDate date) {
        String status = "FAILED";
        LocalDateTime now = LocalDateTime.now();
        String formattedDate = (date != null) ? date.toString() : LocalDate.now().toString();
        String formattedPhone = formatPhoneNumber(parentPhone);
        String messageSummary = "Dear Parent, your ward " + studentName + " was absent on " + formattedDate + ". Please contact the school for further information.";

        String phoneNumberId = whatsAppConfig.getPhoneNumberId();
        String accessToken = whatsAppConfig.getAccessToken();
        String templateName = whatsAppConfig.getTemplateName();
        String languageCode = whatsAppConfig.getTemplateLanguage();

        // Check if WhatsApp Cloud API credentials are configured
        if (phoneNumberId == null || phoneNumberId.isBlank() ||
            accessToken == null || accessToken.isBlank()) {
            logger.warn("Meta WhatsApp Cloud API credentials not configured in environment variables (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN).");
            status = "FAILED (Missing Credentials)";
        } else {
            try {
                // Build Meta WhatsApp Cloud API template request payload
                Map<String, Object> payload = new HashMap<>();
                payload.put("messaging_product", "whatsapp");
                payload.put("recipient_type", "individual");
                payload.put("to", formattedPhone);
                payload.put("type", "template");

                Map<String, Object> template = new HashMap<>();
                template.put("name", templateName);
                template.put("language", Map.of("code", languageCode));

                // Template body parameters: {{1}} = Student Name, {{2}} = Attendance Date
                List<Map<String, String>> parameters = List.of(
                        Map.of("type", "text", "text", studentName),
                        Map.of("type", "text", "text", formattedDate)
                );

                template.put("components", List.of(
                        Map.of("type", "body", "parameters", parameters)
                ));

                payload.put("template", template);

                String endpoint = "/" + phoneNumberId.trim() + "/messages";

                // Execute POST request using Spring RestClient
                String responseBody = restClient.post()
                        .uri(endpoint)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken.trim())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .body(String.class);

                logger.info("WhatsApp message dispatched successfully to {}. Meta API Response: {}", formattedPhone, responseBody);
                status = "SENT";
            } catch (Exception e) {
                // Safely log error without exposing the secret access token
                logger.error("Failed to send WhatsApp notification via Meta Cloud API: {}", e.getMessage());
                status = "FAILED";
            }
        }

        // Persist notification record in MySQL database
        Notification notification = new Notification(
                studentId,
                parentPhone,
                messageSummary,
                status,
                now
        );

        return notificationRepository.save(notification);
    }

    /**
     * Normalizes phone number into international digits without leading '+' or special chars.
     * Meta WhatsApp Cloud API requires numbers like '919876543210'.
     */
    private String formatPhoneNumber(String phone) {
        if (phone == null) return "";
        String cleaned = phone.trim().replaceAll("[^0-9]", "");
        // If 10 digits, assume India (+91)
        if (cleaned.length() == 10) {
            return "91" + cleaned;
        }
        return cleaned;
    }
}
