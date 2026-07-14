package com.ai.resumeanalyzer.service;

import com.ai.resumeanalyzer.payload.ResumeAnalysisResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class AiService {
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isApiKeyAvailable() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    /**
     * Structure for Gemini API Request
     */
    @Data
    private static class GeminiRequest {
        private List<Content> contents;
        private GenerationConfig generationConfig;

        @Data
        public static class Content {
            private List<Part> parts;
        }

        @Data
        public static class Part {
            private String text;
        }

        @Data
        public static class GenerationConfig {
            private String responseMimeType;
        }
    }

    private String callGemini(String prompt) {
        if (!isApiKeyAvailable()) {
            logger.warn("Gemini API key is not configured. Falling back to Mock responses.");
            return null;
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            // Setup Request Body
            GeminiRequest requestBody = new GeminiRequest();
            
            GeminiRequest.Part part = new GeminiRequest.Part();
            part.setText(prompt);

            GeminiRequest.Content content = new GeminiRequest.Content();
            content.setParts(List.of(part));

            GeminiRequest.GenerationConfig config = new GeminiRequest.GenerationConfig();
            config.setResponseMimeType("application/json");

            requestBody.setContents(List.of(content));
            requestBody.setGenerationConfig(config);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse the response JSON from Gemini nested structure: response.candidates[0].content.parts[0].text
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentObj = (Map<String, Object>) candidate.get("content");
                    if (contentObj != null) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error communicating with Gemini API: {}", e.getMessage());
        }
        return null;
    }

    public ResumeAnalysisResponse analyzeResume(String resumeText) {
        String prompt = "Analyze this resume text. Return a JSON object with the following fields:\n" +
                "- overallScore (integer between 0 and 100 representing standard evaluation)\n" +
                "- atsScore (integer between 0 and 100 showing ATS systems compatibility)\n" +
                "- missingSkills (list of strings representing skills standard in this user's domain but missing in resume)\n" +
                "- suggestions (list of strings representing clear, actionable suggestions to improve the resume)\n\n" +
                "Resume Text:\n" + resumeText;

        String rawJson = callGemini(prompt);
        if (rawJson != null) {
            try {
                return objectMapper.readValue(rawJson, ResumeAnalysisResponse.class);
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response for resume analysis: {}", e.getMessage());
            }
        }

        // Fallback Mock Data
        ResumeAnalysisResponse fallback = new ResumeAnalysisResponse();
        fallback.setOverallScore(78);
        fallback.setAtsScore(72);
        fallback.setMissingSkills(Arrays.asList("Docker", "Kubernetes", "System Design", "Unit Testing (JUnit/Mockito)"));
        fallback.setSuggestions(Arrays.asList(
                "Quantify achievements: use numbers and percentages to showcase impact (e.g., 'Optimized query latency by 40%').",
                "Add a dedicated 'Skills' section grouped by category (Languages, Frameworks, Tools).",
                "Elaborate on Spring Boot microservices experiences and include CI/CD tools used."
        ));
        return fallback;
    }

    @Data
    public static class GeneratedQuestion {
        private String questionType;
        private String questionText;
        private List<String> options;
        private String correctAnswer;
    }

    public List<GeneratedQuestion> generateQuestions(String resumeText, String sessionType) {
        String prompt = "Generate exactly 5 interview questions based on the resume text below and the session type: " + sessionType + ".\n" +
                "Rules:\n" +
                "1. If sessionType is 'JAVA_MCQ', generate Java programming Multiple Choice Questions. For each MCQ, provide fields: 'questionType' = 'MCQ', 'questionText', 'options' = list of exactly 4 choices, and 'correctAnswer' = the exact text of the correct choice from the options.\n" +
                "2. If sessionType is 'HR', generate situational behavioral HR questions. Provide fields: 'questionType' = 'HR', 'questionText', 'options' = empty list, and 'correctAnswer' = sample bullet points that make a great response.\n" +
                "3. If sessionType is 'CODING', generate logical coding questions. Provide fields: 'questionType' = 'CODING', 'questionText' (e.g. 'Write a Java method to check...'), 'options' = empty list, and 'correctAnswer' = a clean, commented Java code solution.\n\n" +
                "Output must be a valid JSON array of objects with fields: [questionType, questionText, options, correctAnswer].\n\n" +
                "Resume Text:\n" + resumeText;

        String rawJson = callGemini(prompt);
        if (rawJson != null) {
            try {
                return objectMapper.readValue(rawJson, new TypeReference<List<GeneratedQuestion>>() {});
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response for question generation: {}", e.getMessage());
            }
        }

        // Fallback Mock Data based on sessionType
        List<GeneratedQuestion> fallbackList = new ArrayList<>();
        if ("JAVA_MCQ".equalsIgnoreCase(sessionType)) {
            fallbackList.add(createMcq("Which of the following is NOT a feature of Java?", 
                    Arrays.asList("Object-Oriented", "Use of pointers", "Platform Independent", "Multi-threaded"), "Use of pointers"));
            fallbackList.add(createMcq("What is the default value of local variables in Java?", 
                    Arrays.asList("Null", "0", "Not initialized (causes compile error)", "Depends on data type"), "Not initialized (causes compile error)"));
            fallbackList.add(createMcq("Which class is the superclass of all classes in Java?", 
                    Arrays.asList("Class", "Object", "String", "System"), "Object"));
            fallbackList.add(createMcq("Which keyword is used to prevent method overriding in Java?", 
                    Arrays.asList("static", "constant", "abstract", "final"), "final"));
            fallbackList.add(createMcq("Which interface must be implemented to make an object eligible for serialization?", 
                    Arrays.asList("Cloneable", "Serializable", "Runnable", "Comparable"), "Serializable"));
        } else if ("CODING".equalsIgnoreCase(sessionType)) {
            fallbackList.add(createCoding("Write a Java method to reverse a string without using built-in reverse functions.", 
                    "public String reverse(String str) {\n    if (str == null) return null;\n    StringBuilder sb = new StringBuilder();\n    for (int i = str.length() - 1; i >= 0; i--) {\n        sb.append(str.charAt(i));\n    }\n    return sb.toString();\n}"));
            fallbackList.add(createCoding("Write a Java method to check if a number is prime.", 
                    "public boolean isPrime(int n) {\n    if (n <= 1) return false;\n    for (int i = 2; i <= Math.sqrt(n); i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}"));
            fallbackList.add(createCoding("Write a Java program to find the duplicate elements in an array.", 
                    "public Set<Integer> findDuplicates(int[] arr) {\n    Set<Integer> duplicates = new HashSet<>();\n    Set<Integer> unique = new HashSet<>();\n    for (int num : arr) {\n        if (!unique.add(num)) {\n            duplicates.add(num);\n        }\n    }\n    return duplicates;\n}"));
            fallbackList.add(createCoding("Write a Java method to find the nth Fibonacci number using recursion.", 
                    "public int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}"));
            fallbackList.add(createCoding("Write a Java method to count the number of words in a string.", 
                    "public int countWords(String str) {\n    if (str == null || str.trim().isEmpty()) return 0;\n    return str.trim().split(\"\\\\s+\").length;\n}"));
        } else { // HR
            fallbackList.add(createHr("Tell me about a time you faced a technical challenge and how you resolved it.", 
                    "- Use the STAR method (Situation, Task, Action, Result).\n- Explain the root cause of the bug or problem.\n- Detail your analytical process and actions taken.\n- Highlight the successful outcome and learning."));
            fallbackList.add(createHr("Why do you want to join our company?", 
                    "- Relate company products/culture to your career aspirations.\n- Mention recent projects or achievements of the company that excite you.\n- Show how your skills align with their current requirements."));
            fallbackList.add(createHr("How do you handle disagreements within a development team?", 
                    "- Focus on active listening and empathy.\n- Explain how you look at the technical merits objectively.\n- Talk about finding compromises or seeking team lead guidance to avoid blockers."));
            fallbackList.add(createHr("Tell me about a time you had to learn a new technology quickly.", 
                    "- State the context and why the technology was needed.\n- Describe your study process (docs, tutorials, building a POC).\n- Explain how you applied it successfully to the project."));
            fallbackList.add(createHr("Where do you see yourself in five years?", 
                    "- Express commitment to growing technically (Senior Developer, Architect).\n- Show interest in mentoring others or taking leadership responsibilities.\n- Align your growth with the organization's trajectory."));
        }
        return fallbackList;
    }

    @Data
    public static class EvaluationResponse {
        private Integer score;
        private String aiFeedback;
    }

    public EvaluationResponse evaluateAnswer(String questionText, String correctAnswer, String userAnswer) {
        String prompt = "Evaluate the user's answer to the following question. Compare it to the expected/correct answer and provide feedback.\n" +
                "Question:\n" + questionText + "\n" +
                "Expected Answer:\n" + correctAnswer + "\n" +
                "User's Answer:\n" + userAnswer + "\n\n" +
                "Return a JSON object with fields:\n" +
                "- score (integer from 0 to 100 based on accuracy and details)\n" +
                "- aiFeedback (string giving constructive feedback, highlighting what was correct, what was missing, and the ideal answer details)\n";

        String rawJson = callGemini(prompt);
        if (rawJson != null) {
            try {
                return objectMapper.readValue(rawJson, EvaluationResponse.class);
            } catch (Exception e) {
                logger.error("Failed to parse Gemini response for answer evaluation: {}", e.getMessage());
            }
        }

        // Fallback evaluation logic
        EvaluationResponse response = new EvaluationResponse();
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            response.setScore(0);
            response.setAiFeedback("No answer was provided. The expected answer is: " + correctAnswer);
        } else if (correctAnswer.equalsIgnoreCase(userAnswer.trim())) {
            response.setScore(100);
            response.setAiFeedback("Correct! Excellent job.");
        } else {
            // General assessment for text answers
            response.setScore(75);
            response.setAiFeedback("Good attempt. Your answer covers some key aspects, but could be enhanced with more details. Expected reference: " + correctAnswer);
        }
        return response;
    }

    private GeneratedQuestion createMcq(String text, List<String> options, String answer) {
        GeneratedQuestion q = new GeneratedQuestion();
        q.setQuestionType("MCQ");
        q.setQuestionText(text);
        q.setOptions(options);
        q.setCorrectAnswer(answer);
        return q;
    }

    private GeneratedQuestion createCoding(String text, String answer) {
        GeneratedQuestion q = new GeneratedQuestion();
        q.setQuestionType("CODING");
        q.setQuestionText(text);
        q.setCorrectAnswer(answer);
        q.setOptions(new ArrayList<>());
        return q;
    }

    private GeneratedQuestion createHr(String text, String answer) {
        GeneratedQuestion q = new GeneratedQuestion();
        q.setQuestionType("HR");
        q.setQuestionText(text);
        q.setCorrectAnswer(answer);
        q.setOptions(new ArrayList<>());
        return q;
    }
}
