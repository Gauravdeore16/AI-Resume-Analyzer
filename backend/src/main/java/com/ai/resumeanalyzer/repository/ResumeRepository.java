package com.ai.resumeanalyzer.repository;

import com.ai.resumeanalyzer.entity.Resume;
import com.ai.resumeanalyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUser(User user);
    List<Resume> findByUserIdOrderByUploadedAtDesc(Long userId);
}
