CREATE TABLE
  duty (
    id int NOT NULL AUTO_INCREMENT,
    dayNumber int DEFAULT NULL,
    timeFrom char(5) DEFAULT NULL,
    timeTo char(5) DEFAULT NULL,
    tag varchar(50) DEFAULT NULL,
    userId bigint NOT NULL,
    chatId bigint NOT NULL,
    PRIMARY KEY (id)
  )
