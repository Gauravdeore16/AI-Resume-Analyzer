package com.ai.resumeanalyzer.payload;

import lombok.Data;
import java.util.List;

@Data
public class SubmitAnswersRequest {
    private List<AnswerDto> answers;

    @Data
    public static class AnswerDto {
        private Long questionId;
        private String userAnswer;
    }
}
