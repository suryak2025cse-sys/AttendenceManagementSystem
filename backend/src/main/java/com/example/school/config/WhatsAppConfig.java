package com.example.school.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class WhatsAppConfig {

    @Value("${whatsapp.api-url:https://graph.facebook.com/v19.0}")
    private String apiUrl;

    @Value("${whatsapp.phone-number-id:}")
    private String phoneNumberId;

    @Value("${whatsapp.access-token:}")
    private String accessToken;

    @Value("${whatsapp.template-name:school_attendance_absent}")
    private String templateName;

    @Value("${whatsapp.template-language:en_US}")
    private String templateLanguage;

    @Bean
    public RestClient whatsAppRestClient() {
        return RestClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getPhoneNumberId() {
        return phoneNumberId;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getTemplateName() {
        return templateName;
    }

    public String getTemplateLanguage() {
        return templateLanguage;
    }
}
