# ========= build stage：compile Spring Boot with Maven (Java 21) =========
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn -q -e -DskipTests=true dependency:go-offline

COPY src ./src

# package and generate target/*.jar
RUN mvn clean package -DskipTests

# ========= run stage: Java 21 JRE =========
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

