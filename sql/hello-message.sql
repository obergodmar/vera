CREATE TABLE
  hello_message (
    id int NOT NULL AUTO_INCREMENT,
    message text,
    chatId bigint NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY chatId (chatId)
  );
