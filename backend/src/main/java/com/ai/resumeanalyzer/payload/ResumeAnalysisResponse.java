package com.ai.resumeanalyzer.payload;

import lombok.Data;
import java.util.List;

@Data
public class ResumeAnalysisResponse {
    private Integer overallScore;
    private Integer atsScore;
    private List<String> missingSkills;
    private List<String> suggestions;
}
