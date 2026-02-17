-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-02-2026 a las 18:53:41
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

--
-- Volcado de datos para la tabla `animatronico_local`
--

INSERT INTO `animatronico_local` (`id_animatronico`, `id_local`, `fecha_instalacion`, `estado`) VALUES
(1, 4, '1991-04-07', 'Operativo'),
(2, 4, '1991-04-07', 'Operativo'),
(3, 4, '1991-04-07', 'Operativo'),
(4, 4, '1991-04-07', 'Operativo'),
(5, 1, '1983-06-01', 'Fuera de servicio'),
(6, 1, '1983-06-01', 'Fuera de servicio'),
(7, 1, '1983-06-01', 'Fuera de servicio'),
(8, 1, '1983-06-01', 'Fuera de servicio'),
(9, 2, '1987-08-08', 'Fuera de servicio'),
(10, 2, '1987-08-08', 'Fuera de servicio'),
(11, 2, '1987-08-08', 'Fuera de servicio'),
(12, 2, '1987-08-08', 'Fuera de servicio'),
(13, 2, '1987-08-08', 'Fuera de servicio'),
(14, 2, '1987-08-08', 'Fuera de servicio'),
(15, 3, '1997-05-03', 'Fuera de servicio'),
(16, 3, '1997-05-03', 'Fuera de servicio'),
(17, 3, '1997-05-03', 'Fuera de servicio'),
(18, 3, '1997-05-03', 'Fuera de servicio');

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
  `nombre` varchar(255) NOT NULL,
  `icono` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos_animatronicos`
--

INSERT INTO `tipos_animatronicos` (`id`, `nombre`, `icono`) VALUES
(1, 'Clásicos', NULL),
(2, 'Unwithered', NULL),
(3, 'Toys', NULL),
(4, 'Funtime', NULL),
(6, 'foxy', '/Icons/tipos/ToyFoxyP-1771346153052-585266879.png');

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
(1, 'admin_fazbear', '$2a$10$nKQa40bvwiAJW10Qd0koPuy0PWxNy3AVtWckWDPi5QPQf37vWAHoC', 'admin@fazbear.com', 1, 2),
(2, 'tecnico_1', '$2a$10$N.OKPIJG/3XzHwWFflOH4ugO5BdRPQ8wwoXpGEMqelDSbNBxXSkre', 'tech@fazbear.com', 2, 3),
(3, 'guardia_noche', '$2a$10$HiZ5JLjgQucu8OcaJJNP1OBuRbap0JMgW2LYP5D.hZXuB.fbb7Jnu', 'guard@fazbear.com', 3, 2),
(4, 'juan', '$2a$10$QQ/uRfB4P67G9M5Of9rBG.AlJF5Z0RJUe3StemkcEv9z8ykovoQSa', 'gabriel@gmail.com', 3, 1),
(5, 'William Afton', '$2a$10$IdlDYY8uxBBWd2luFXAKL.Yps8Gpy2ItjbNH5/jvKPGjwgTMsEz.S', 'wafton@fazbear.com', 1, 3),
(6, 'Henry Emily', '$2a$10$Qc/Jay5UF2Fe1/xMLP9gj.n7tVlCSO4T7pfrb4BgUqun6uQXOmAMe', 'hemily@fazbear.com', 1, 1),
(7, 'Michael Afton', '$2a$10$OHs4Sab125hoa5FOXUN0U.1xgbyeCtt.Xesdr5b8Vaf6E.iQWD28K', 'mafton@fazbear.com', 2, 1),
(8, 'Ralph', '$2a$10$1KGT/1voWRrR5zYzFMfm4OCl3/wo74BhrMjaZTDQ6ucaBEYbAabGK', 'phoneguy@fazbear.com', 2, 1),
(9, 'Clay Burke', '$2a$10$yo8CHGs9p8LsSA8llenQDermM0T3datTFwcdufjgMGHRCikpoF656', 'cburke@fazbear.com', 2, 2),
(10, 'Jeremy Fitzgerald', '$2a$10$Lzr1HCCvF4qfQ8KbulXCMuMUVd2D7qsh0ZxI8Ot4wYUUslIa6oHqq', 'jfitzgerald@fazbear.com', 3, 1),
(11, 'Vanessa Shelley', '$2a$10$37B19NvMcDe1nC/9AtYGm.MLgHgG0F2D9XPKqcvkemqMqsV/WmjYu', 'vshelley@fazbear.com', 3, 4),
(12, 'Fritz Smith', '$2a$10$7PC9QgAc2F1MavIGEhWqkOl8VL0FjIsuRjL8VjOonMi0acSunKrL6', 'fsmith@fazbear.com', 3, 3),
(13, 'Cassidy', '$2a$10$.pfjqnepK7yp2IHAHcZay.LBJNVfQoduCqa6dpiGKcDxgtJkjgFnq', 'cassidy@fazbear.com', 4, 1),
(14, 'Susie', '$2a$10$E7mO8uwtrej5eE9CisPWxe2F4xedzfgM6cIPPjmXFPwNdGLGUt3D.', 'susie@fazbear.com', 4, 3),
(15, 'Gabriel', '$2a$10$R5jdTpntXxElVkBCBB.g9ekDg3ytycGTBSocWu05gf2rzJLws8PaS', 'gabriel@fazbear.com', 4, 4),
(16, 'Oliver Brown', '$2a$10$VOSw.ij3AtiBDUAi47X4iu9E4nLIHNjKssk4UuC6NGs.glboir3dC', 'obrown@fazbear.com', 5, 3),
(17, 'Mary Schmidt', '$2a$10$dfuMcvGtSHhIxN8SeqMU2u5HwUGTN958hDrskXiVoiDtUOgdz05fq', 'mschmidt@fazbear.com', 5, 2),
(18, 'Edward Collins', '$2a$10$4DFyWx6.nE5sN9SMpy0BmOtBrwObor.bBBnzY/4qfXGrnFhBDH6J.', 'ecollins@fazbear.com', 5, 4),
(19, 'Robert Fazbear', '$2a$10$Y7V8RpQ6l3S4a/YX6jvfS.S3nHP/OJUnlLzLIdlp3eHT8tYafC3cu', 'rfazbear@fazbear.com', 1, 4),
(20, 'ejemplo', '$2a$10$pVrrb3b97DWKYn505rrTPeZ23ddYOrd3rsVZ82RvjmAMeuZtchsaG', 'ejem2@gmail.com', 6, 0),
(21, 'William2', '$2a$10$PzTM1Y4m/amkDEvusQXsRes8kqMfsoCOupWfEjBBUrwZUr58ta9gy', 'ana@tm.com', 3, 1);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKdc3yt6c0ifauu675sn383tpih` (`id_rol`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `FKdc3yt6c0ifauu675sn383tpih` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
