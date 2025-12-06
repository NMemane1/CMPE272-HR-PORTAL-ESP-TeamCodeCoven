package com.teamcodecoven.hrportal.payroll;

public class PayrollRecord {

    private Long id;
    private Long employeeId;
    private String month;      // e.g. "2025-11"
    private double baseSalary;
    private double bonus;
    private double deductions;
    private double netPay;

    public PayrollRecord() {
    }

    public PayrollRecord(Long id,
                         Long employeeId,
                         String month,
                         double baseSalary,
                         double bonus,
                         double deductions,
                         double netPay) {
        this.id = id;
        this.employeeId = employeeId;
        this.month = month;
        this.baseSalary = baseSalary;
        this.bonus = bonus;
        this.deductions = deductions;
        this.netPay = netPay;
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

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public double getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(double baseSalary) {
        this.baseSalary = baseSalary;
    }

    public double getBonus() {
        return bonus;
    }

    public void setBonus(double bonus) {
        this.bonus = bonus;
    }

    public double getDeductions() {
        return deductions;
    }

    public void setDeductions(double deductions) {
        this.deductions = deductions;
    }

    public double getNetPay() {
        return netPay;
    }

    public void setNetPay(double netPay) {
        this.netPay = netPay;
    }
}