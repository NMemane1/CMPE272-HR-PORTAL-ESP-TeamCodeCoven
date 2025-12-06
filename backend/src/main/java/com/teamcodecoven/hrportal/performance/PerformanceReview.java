package com.teamcodecoven.hrportal.performance;

public class PerformanceReview {

    private Long id;
    private Long employeeId;
    private Long reviewerId;
    private String period;  // e.g. "2024-H1"
    private double rating;  // 1.0 - 5.0
    private String comments;

    public PerformanceReview() {
    }

    public PerformanceReview(Long id,
                             Long employeeId,
                             Long reviewerId,
                             String period,
                             double rating,
                             String comments) {
        this.id = id;
        this.employeeId = employeeId;
        this.reviewerId = reviewerId;
        this.period = period;
        this.rating = rating;
        this.comments = comments;
    }

    // --- getters & setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}