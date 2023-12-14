CREATE TABLE
  cron (
    id int NOT NULL AUTO_INCREMENT,
    chatId bigint NOT NULL,
    message text NOT NULL,
    daysRange text NOT NULL,
    timeAt char(5) NOT NULL,
    enabled tinyint (1) DEFAULT NULL,
    buttons text,
    PRIMARY KEY (id)
  );
