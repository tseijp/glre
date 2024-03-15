DROP TABLE IF EXISTS `creation`;
CREATE TABLE `creation` (
  `id` TEXT PRIMARY KEY,
  `title` TEXT DEFAULT NULL,
  `content` TEXT DEFAULT NULL,
  `created_at` TEXT DEFAULT (datetime('now')),
  `updated_at` TEXT DEFAULT (datetime('now'))
);
INSERT INTO `creation` (id, title, content) VALUES ('a_id', 'a_title', 'a_content');
INSERT INTO `creation` (id, title, content) VALUES ('b_id', 'b_title', 'b_content');
INSERT INTO `creation` (id, title, content) VALUES ('c_id', 'c_title', 'c_content');
