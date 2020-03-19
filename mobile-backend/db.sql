use rafaeld; # Byt till din egen

drop table messages;
drop table matches;
drop table lobbies;
drop table persons;

create table persons (
	id int NOT NULL AUTO_INCREMENT,
	username varchar(64),
	password varchar(64),
	highscore int,
	access_token varchar(64),
	token_expiration DATETIME,
	PRIMARY KEY (id)
);

create table matches (
	id int NOT NULL AUTO_INCREMENT,
	date DATETIME,
	host_id int,
	challenger_id int,
	host_score int,
	challenger_score int,
	winner_id int,
	PRIMARY KEY (id),
	FOREIGN KEY (winner_id) REFERENCES persons (id) ON DELETE CASCADE,
	FOREIGN KEY (host_id) REFERENCES persons (id) ON DELETE CASCADE,
	FOREIGN KEY (challenger_id) REFERENCES persons (id) ON DELETE CASCADE
);

create table lobbies (
	id int NOT NULL AUTO_INCREMENT,
        host_id int,
	host_name varchar(64),
	challenger_id int,
	challenger_name varchar(64),
	date DATETIME,
	password varchar(64),
	lobby_name varchar(64),
	host_score int,
	challenger_score int,
	host_ready int,
	challenger_ready int,
	PRIMARY KEY (id),
	FOREIGN KEY (host_id) REFERENCES persons (id) ON DELETE CASCADE,
	FOREIGN KEY (challenger_id) REFERENCES persons (id) ON DELETE CASCADE
);

create table messages (
	id int NOT NULL AUTO_INCREMENT,
	text varchar(2000),
	lobby_id int,
	date DATETIME,
	sender_name varchar(64),
	PRIMARY KEY (id),
	FOREIGN KEY (lobby_id) REFERENCES lobbies (id) ON DELETE CASCADE
);


-- DUMMY PERSONS AND VALUES
