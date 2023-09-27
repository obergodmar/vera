CREATE TABLE
  settings (
    opt varchar(150) NOT NULL,
    val text,
    created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (opt)
  )
