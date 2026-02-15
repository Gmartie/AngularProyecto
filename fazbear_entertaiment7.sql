-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-02-2026 a las 10:59:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `fazbear_entertaiment`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `animatronicos`
--

CREATE TABLE `animatronicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `reconocimiento` tinyint(1) NOT NULL,
  `num_piezas` int(11) NOT NULL,
  `id_gama` int(11) NOT NULL,
  `planos` varchar(255) NOT NULL,
  `foto` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `animatronicos`
--

INSERT INTO `animatronicos` (`id`, `nombre`, `reconocimiento`, `num_piezas`, `id_gama`, `planos`, `foto`) VALUES
(1, 'Freddy Fazbear', 1, 120, 1, 'freddy_clasico_planos.png', 'freddy_clasico.jpg'),
(2, 'Bonnie', 1, 115, 1, 'bonnie_clasico_planos.png', 'bonnie_clasico.jpg'),
(3, 'Chica', 1, 110, 1, 'chica_clasica_planos.png', 'chica_clasica.jpg'),
(4, 'Foxy', 1, 105, 1, 'foxy_clasico_planos.png', 'foxy_clasico.jpg'),
(5, 'Freddy Unwithered', 1, 125, 2, 'freddy_unw_planos.png', 'freddy_unw.jpg'),
(6, 'Bonnie Unwithered', 1, 120, 2, 'bonnie_unw_planos.png', 'bonnie_unw.jpg'),
(7, 'Chica Unwithered', 1, 118, 2, 'chica_unw_planos.png', 'chica_unw.jpg'),
(8, 'Foxy Unwithered', 1, 112, 2, 'foxy_unw_planos.png', 'foxy_unw.jpg'),
(9, 'Toy Freddy', 1, 120, 3, 'toy_freddy_planos.png', 'toy_freddy.jpg'),
(10, 'Toy Bonnie', 1, 115, 3, 'toy_bonnie_planos.png', 'toy_bonnie.jpg'),
(11, 'Toy Chica', 1, 110, 3, 'toy_chica_planos.png', 'toy_chica.jpg'),
(12, 'Mangle', 0, 130, 3, 'mangle_planos.png', 'mangle.jpg'),
(13, 'Balloon Boy', 0, 90, 3, 'bb_planos.png', 'balloon_boy.jpg'),
(14, 'Puppet', 1, 100, 3, 'puppet_planos.png', 'puppet.jpg'),
(15, 'Circus Baby', 1, 140, 4, 'baby_planos.png', 'circus_baby.jpg'),
(16, 'Funtime Freddy', 1, 135, 4, 'ft_freddy_planos.png', 'ft_freddy.jpg'),
(17, 'Funtime Foxy', 1, 130, 4, 'ft_foxy_planos.png', 'ft_foxy.jpg'),
(18, 'Ballora', 1, 125, 4, 'ballora_planos.png', 'ballora.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `animatronico_local`
--

CREATE TABLE `animatronico_local` (
  `id_animatronico` int(11) NOT NULL,
  `id_local` int(11) NOT NULL,
  `fecha_instalacion` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `locales`
--

CREATE TABLE `locales` (
  `id` int(11) NOT NULL,
  `fecha_apertura` date NOT NULL,
  `aforo` int(11) NOT NULL,
  `foto` varchar(255) NOT NULL,
  `ciudad` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `abierto` tinyint(1) NOT NULL,
  `id_propietario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `locales`
--

INSERT INTO `locales` (`id`, `fecha_apertura`, `aforo`, `foto`, `ciudad`, `direccion`, `abierto`, `id_propietario`) VALUES
(1, '1983-06-01', 120, 'freddy_pizza_1983.jpg', 'Hurricane', 'Main Street 87', 0, 6),
(2, '1987-08-08', 150, 'freddy_pizza_1987.jpg', 'Hurricane', 'Jefferson Ave 12', 0, 1),
(3, '1997-05-03', 200, 'circus_baby_ent.jpg', 'Hurricane', 'Industrial Zone 4', 0, 5),
(4, '1991-04-07', 100, 'freddy_pizza_1991.jpg', 'Hurricane', 'Orleans 79', 0, 19);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `rol` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `rol`) VALUES
(1, 'Propietario'),
(2, 'Técnico'),
(3, 'Guardia de seguridad'),
(4, 'Empleado'),
(5, 'Cocinero'),
(6, 'Administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_animatronicos`
--

CREATE TABLE `tipos_animatronicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos_animatronicos`
--

INSERT INTO `tipos_animatronicos` (`id`, `nombre`) VALUES
(1, 'Clásicos'),
(2, 'Unwithered'),
(3, 'Toys'),
(4, 'Funtime');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `id_local` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `usuario`, `pass`, `correo`, `id_rol`, `id_local`) VALUES
(1, 'admin_fazbear', 'admin123', 'admin@fazbear.com', 1, 2),
(2, 'tecnico_1', 'tech123', 'tech@fazbear.com', 2, 3),
(3, 'guardia_noche', 'night123', 'guard@fazbear.com', 3, 2),
(4, 'juan', '123456', 'gabriel@gmail.com', 3, 1),
(5, 'William Afton', '1234', 'wafton@fazbear.com', 1, 3),
(6, 'Henry Emily', '1234', 'hemily@fazbear.com', 1, 1),
(7, 'Michael Afton', '1234', 'mafton@fazbear.com', 2, 1),
(8, 'Ralph', '1234', 'phoneguy@fazbear.com', 2, 1),
(9, 'Clay Burke', '1234', 'cburke@fazbear.com', 2, 2),
(10, 'Jeremy Fitzgerald', '1234', 'jfitzgerald@fazbear.com', 3, 1),
(11, 'Vanessa Shelley', '1234', 'vshelley@fazbear.com', 3, 4),
(12, 'Fritz Smith', '1234', 'fsmith@fazbear.com', 3, 3),
(13, 'Cassidy', '1234', 'cassidy@fazbear.com', 4, 1),
(14, 'Susie', '1234', 'susie@fazbear.com', 4, 3),
(15, 'Gabriel', '1234', 'gabriel@fazbear.com', 4, 4),
(16, 'Oliver Brown', '1234', 'obrown@fazbear.com', 5, 3),
(17, 'Mary Schmidt', '1234', 'mschmidt@fazbear.com', 5, 2),
(18, 'Edward Collins', '1234', 'ecollins@fazbear.com', 5, 4),
(19, 'Robert Fazbear', '1234', 'rfazbear@fazbear.com', 1, 4),
(20, 'ejemplo', '123456', 'ejem2@gmail.com', 3, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `animatronicos`
--
ALTER TABLE `animatronicos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_gama` (`id_gama`);

--
-- Indices de la tabla `animatronico_local`
--
ALTER TABLE `animatronico_local`
  ADD PRIMARY KEY (`id_animatronico`,`id_local`),
  ADD KEY `id_local` (`id_local`);

--
-- Indices de la tabla `locales`
--
ALTER TABLE `locales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_propietario` (`id_propietario`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipos_animatronicos`
--
ALTER TABLE `tipos_animatronicos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `animatronicos`
--
ALTER TABLE `animatronicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `locales`
--
ALTER TABLE `locales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tipos_animatronicos`
--
ALTER TABLE `tipos_animatronicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `animatronicos`
--
ALTER TABLE `animatronicos`
  ADD CONSTRAINT `animatronicos_ibfk_1` FOREIGN KEY (`id_gama`) REFERENCES `tipos_animatronicos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `animatronico_local`
--
ALTER TABLE `animatronico_local`
  ADD CONSTRAINT `animatronico_local_ibfk_1` FOREIGN KEY (`id_animatronico`) REFERENCES `animatronicos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `animatronico_local_ibfk_2` FOREIGN KEY (`id_local`) REFERENCES `locales` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `locales`
--
ALTER TABLE `locales`
  ADD CONSTRAINT `locales_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
