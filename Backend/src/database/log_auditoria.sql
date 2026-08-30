-- Tabla de auditoria de acciones sensibles (Semana 4).
-- Requerida para registrar quien realizo la accion (id_usuario), que accion fue
-- (ALTA/BAJA/MODIFICACION), sobre que entidad, con qué id_entidad y con qué detalle.

CREATE TABLE IF NOT EXISTS `log_auditoria` (
  `id` tinyint(4) NOT NULL,
  `id_usuario` tinyint(4) NOT NULL,
  `accion` varchar(20) NOT NULL,
  `entidad` varchar(30) NOT NULL,
  `id_entidad` tinyint(4) DEFAULT NULL,
  `detalle` varchar(255) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE `log_auditoria`
  MODIFY `id` tinyint(4) NOT NULL AUTO_INCREMENT;

ALTER TABLE `log_auditoria`
  ADD CONSTRAINT `log_auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);
