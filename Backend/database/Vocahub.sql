-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: vocahub
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `decks`
--

DROP TABLE IF EXISTS `decks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `decks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` enum('manual','import') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_decks_user_updated` (`user_id`,`updated_at`),
  CONSTRAINT `fk_decks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `decks`
--

LOCK TABLES `decks` WRITE;
/*!40000 ALTER TABLE `decks` DISABLE KEYS */;
INSERT INTO `decks` VALUES ('0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','test 1','manual','2026-09-04 13:44:00.590','2026-09-04 13:44:00.590');
/*!40000 ALTER TABLE `decks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_batches`
--

DROP TABLE IF EXISTS `import_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_batches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deck_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_rows` int unsigned NOT NULL,
  `valid_rows` int unsigned NOT NULL,
  `invalid_rows` int unsigned NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_import_batches_user_created` (`user_id`,`created_at`),
  KEY `fk_import_batches_deck` (`deck_id`),
  CONSTRAINT `fk_import_batches_deck` FOREIGN KEY (`deck_id`) REFERENCES `decks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_import_batches_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_batches`
--

LOCK TABLES `import_batches` WRITE;
/*!40000 ALTER TABLE `import_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,1730000000000,'InitialSchema1730000000000'),(2,1730000001000,'CompleteAuthSchema1730000001000');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_logs`
--

DROP TABLE IF EXISTS `review_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vocabulary_entry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deck_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` enum('again','hard','good') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode` enum('flashcard','quiz') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_review_logs_deck_reviewed` (`deck_id`,`reviewed_at`),
  KEY `idx_review_logs_user_reviewed` (`user_id`,`reviewed_at`),
  KEY `fk_review_logs_entry` (`vocabulary_entry_id`),
  CONSTRAINT `fk_review_logs_deck` FOREIGN KEY (`deck_id`) REFERENCES `decks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_logs_entry` FOREIGN KEY (`vocabulary_entry_id`) REFERENCES `vocabulary_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_logs`
--

LOCK TABLES `review_logs` WRITE;
/*!40000 ALTER TABLE `review_logs` DISABLE KEYS */;
INSERT INTO `review_logs` VALUES ('41d67ffa-55e5-48c8-8d5a-d00c6b14b72b','6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','again','flashcard','2026-09-04 13:49:57.508'),('4ad35c92-1d62-4552-85cb-1e25aab4eaae','6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','hard','flashcard','2026-09-04 13:49:52.348'),('4e79c27a-1eaf-42a5-bc9c-033017a49e0f','6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','hard','flashcard','2026-09-04 14:24:45.502'),('b209e6b7-9152-46c3-9509-8ed9704e8895','6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','good','flashcard','2026-09-04 13:50:01.399'),('cd946981-7039-4a5e-bf5a-754f3cd03cfd','6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','good','flashcard','2026-09-04 14:27:45.100'),('f23568e7-2d77-44bc-84d0-ab3cf0173041','6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','hard','flashcard','2026-09-04 13:49:59.558'),('f7839951-a45d-4f70-a03e-51c919758549','6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','again','flashcard','2026-09-04 14:24:56.416');
/*!40000 ALTER TABLE `review_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('196a32b9-dab5-4131-b1fe-ebd32c0d7ef1','congtrung@gmail.com','$2b$12$cGaf6VAZ5PT0yO1p5mo5WONxwniuuHRM8dHVZyr10U9xGFh5bamj2','2026-09-04 13:43:53.277','2026-09-04 13:43:53.277');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vocabulary_entries`
--

DROP TABLE IF EXISTS `vocabulary_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vocabulary_entries` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deck_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `term` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meaning` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pronunciation` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `example` text COLLATE utf8mb4_unicode_ci,
  `part_of_speech` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('new','learning','mastered') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `last_reviewed_at` datetime(3) DEFAULT NULL,
  `next_review_at` datetime(3) NOT NULL,
  `correct_count` int unsigned NOT NULL DEFAULT '0',
  `incorrect_count` int unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_entries_deck` (`deck_id`),
  KEY `idx_entries_next_review` (`next_review_at`),
  KEY `idx_entries_deck_next_review` (`deck_id`,`next_review_at`),
  CONSTRAINT `fk_entries_deck` FOREIGN KEY (`deck_id`) REFERENCES `decks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vocabulary_entries`
--

LOCK TABLES `vocabulary_entries` WRITE;
/*!40000 ALTER TABLE `vocabulary_entries` DISABLE KEYS */;
INSERT INTO `vocabulary_entries` VALUES ('6c397dc9-9634-439e-a252-f289e47de3e4','0e7dcf3f-df47-468f-8204-ccf0201f0a08','hello','xin chào','helo','hello, nice to meet you!','Động từ (v)','mastered','2026-09-04 14:27:45.095','2026-09-07 14:27:45.095',2,5,'2026-09-04 13:44:28.004','2026-09-04 14:27:45.000');
/*!40000 ALTER TABLE `vocabulary_entries` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-04 14:37:25
