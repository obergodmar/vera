CREATE TABLE
  peer (
    id int NOT NULL AUTO_INCREMENT,
    peerId bigint NOT NULL,
    firstName varchar(255) DEFAULT NULL,
    lastName varchar(255) DEFAULT NULL,
    avatar text,
    screenName varchar(50) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY screenName (screenName)
  )
