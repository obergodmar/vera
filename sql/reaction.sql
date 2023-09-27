CREATE TABLE
  reaction (
    id int NOT NULL AUTO_INCREMENT,
    textTrigger text NOT NULL,
    reaction text NOT NULL,
    chatId bigint NOT NULL,
    enabled tinyint (1) NOT NULL,
    PRIMARY KEY (id)
  )
