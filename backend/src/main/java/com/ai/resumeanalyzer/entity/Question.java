package com.ai.resumeanalyzer.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private InterviewSession session;

    @Column(name = "question_type", nullable = false)
    private String questionType; // "MCQ", "HR", "CODING"

    @Lob
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Lob
    @Column(name = "options", columnDefinition = "TEXT")
    private String options; // For MCQs: JSON string or semi-colon separated list

    @Lob
    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Lob
    @Column(name = "user_answer", columnDefinition = "TEXT")
    private String userAnswer;

    @Lob
    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "score")
    private Integer score; // Individual question score (0-100)
}
