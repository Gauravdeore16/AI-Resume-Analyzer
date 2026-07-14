package com.ai.resumeanalyzer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Lob
    @Column(name = "file_text", columnDefinition = "LONGTEXT")
    private String fileText;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Lob
    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Lob
    @Column(name = "suggestions", columnDefinition = "TEXT")
    private String suggestions;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}
