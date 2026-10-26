-- Talleres publicados desde el 20 de octubre.
-- Ubicaciones pendientes de confirmar.
-- Lunes = 1, domingo = 7.

INSERT INTO weekly_activities (
    id, period_id, name, type, weekday,
    start_time, end_time,
    responsible_name, responsible_role, location,
    valid_from, valid_until
)
VALUES
    (
        'workshop-yoga', '2026-2',
        'Modo zen · Yoga', 'workshop', 2,
        '11:30', '12:50',
        'Mariela Mahias', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-tenis-mesa', '2026-2',
        'Entre mesas y paletas · Tenis de mesa', 'workshop', 2,
        '13:00', '15:00',
        'Jaime Araya', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-arte-urbano', '2026-2',
        'Arte sin muros · Arte urbano', 'workshop', 2,
        '18:00', '19:00',
        'Camila Espina', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-defensa-personal', '2026-2',
        'Modo ninja · Defensa personal', 'workshop', 3,
        '13:00', '14:20',
        'José Bernales', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-danza-urbana', '2026-2',
        'Flow en la pista · Danza urbana', 'workshop', 3,
        '15:20', '16:40',
        'Francisca Carraco', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-basquetbol', '2026-2',
        'De rebote al aro · Básquetbol', 'workshop', 3,
        '15:20', '16:50',
        'Bárbara Araya', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-voleibol', '2026-2',
        'Que no toque el suelo · Voleibol', 'workshop', 3,
        '16:50', '18:10',
        'Club Vive Voller', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-natacion', '2026-2',
        'Sálvese quien nade · Natación', 'workshop', 4,
        '11:30', '12:50',
        'Andrés Ferreira', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-amigurumi', '2026-2',
        'Punto a punto · Amigurumi', 'workshop', 4,
        '11:30', '12:30',
        'María José Osorio', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-voz', '2026-2',
        'Do re mi fa sol la siii · Uso de la voz', 'workshop', 4,
        '13:00', '14:20',
        'Nirvana Sotomayor', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-danza-arabe', '2026-2',
        'Entre velos y movimientos · Danza árabe', 'workshop', 4,
        '14:20', '15:20',
        'Constanza Neira', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    ),
    (
        'workshop-lengua-senas', '2026-2',
        'Señas que conectan · Lengua de señas chilena, nivel básico',
        'workshop', 5,
        '13:00', '14:20',
        'Franklin Cubillán', 'facilitator', NULL,
        '2026-10-20', '2026-12-19'
    );

-- Inicio de clases por período académico
INSERT INTO academic_dates (
    id, period_id, title, starts_on, ends_on, featured, source
) VALUES (
    'semester-start-2026-2',
    '2026-2',
    'Inicio de clases',
    '2026-08-03',
    '2026-08-03',
    0,
    'Fecha confirmada para el segundo semestre de 2026'
)
ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    starts_on = excluded.starts_on,
    ends_on = excluded.ends_on,
    source = excluded.source;
