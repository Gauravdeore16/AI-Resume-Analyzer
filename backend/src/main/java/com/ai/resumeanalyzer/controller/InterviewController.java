package com.ai.resumeanalyzer.controller;

import com.ai.resumeanalyzer.entity.*;
import com.ai.resumeanalyzer.payload.MessageResponse;
import com.ai.resumeanalyzer.payload.SubmitAnswersRequest;
import com.ai.resumeanalyzer.repository.InterviewSessionRepository;
import com.ai.resumeanalyzer.repository.QuestionRepository;
import com.ai.resumeanalyzer.repository.ResumeRepository;
import com.ai.resumeanalyzer.repository.UserRepository;
import com.ai.resumeanalyzer.security.UserDetailsImpl;
import com.ai.resumeanalyzer.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AiService aiService;

    private User getAuthenticatedUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    @PostMapping("/start")
    public ResponseEntity<?> startInterview(
            @RequestParam("sessionType") String sessionType,
            @RequestParam(value = "resumeId", required = false) Long resumeId) {

        User user = getAuthenticatedUser();
        Resume resume = null;

        // If resumeId is provided, look it up. Otherwise, grab their latest resume.
        if (resumeId != null) {
            resume = resumeRepository.findById(resumeId).orElse(null);
        } else {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId());
            if (!userResumes.isEmpty()) {
                resume = userResumes.get(0);
            }
        }

        String resumeText = "General Software Developer candidate with knowledge of Java, Spring Boot, React, and SQL database systems.";
        if (resume != null && resume.getFileText() != null) {
            resumeText = resume.getFileText();
        }

        // Generate tailored questions via AI
        List<AiService.GeneratedQuestion> rawQuestions = aiService.generateQuestions(resumeText, sessionType);

        // Build session
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .resume(resume)
                .sessionType(sessionType.toUpperCase())
                .score(null) // Starts as null, gets computed upon submission
                .build();

        List<Question> questionsList = new ArrayList<>();
        for (AiService.GeneratedQuestion rq : rawQuestions) {
            // Options list to comma/semicolon separated string
            String optionsStr = null;
            if (rq.getOptions() != null && !rq.getOptions().isEmpty()) {
                optionsStr = String.join(";;", rq.getOptions());
            }

            Question q = Question.builder()
                    .session(session)
                    .questionType(rq.getQuestionType())
                    .questionText(rq.getQuestionText())
                    .options(optionsStr)
                    .correctAnswer(rq.getCorrectAnswer())
                    .build();
            questionsList.add(q);
        }

        session.setQuestions(questionsList);
        InterviewSession savedSession = interviewSessionRepository.save(session);
        return ResponseEntity.ok(savedSession);
    }

    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<?> submitAnswers(
            @PathVariable Long sessionId,
            @RequestBody SubmitAnswersRequest request) {

        User user = getAuthenticatedUser();
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Access denied"));
        }

        int totalScore = 0;
        int questionsEvaluated = 0;

        for (SubmitAnswersRequest.AnswerDto answerDto : request.getAnswers()) {
            Question question = questionRepository.findById(answerDto.getQuestionId())
                    .orElse(null);

            if (question != null && question.getSession().getId().equals(session.getId())) {
                question.setUserAnswer(answerDto.getUserAnswer());

                // Evaluate answer via AI
                AiService.EvaluationResponse eval = aiService.evaluateAnswer(
                        question.getQuestionText(),
                        question.getCorrectAnswer(),
                        answerDto.getUserAnswer()
                );

                question.setScore(eval.getScore());
                question.setAiFeedback(eval.getAiFeedback());
                questionRepository.save(question);

                totalScore += eval.getScore();
                questionsEvaluated++;
            }
        }

        if (questionsEvaluated > 0) {
            session.setScore(totalScore / questionsEvaluated);
            interviewSessionRepository.save(session);
        }

        return ResponseEntity.ok(session);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getInterviewHistory() {
        User user = getAuthenticatedUser();
        List<InterviewSession> history = interviewSessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterviewById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        InterviewSession session = interviewSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Access denied"));
        }

        return ResponseEntity.ok(session);
    }
}
