INSERT INTO academic_periods (
    id, name, timezone, semester_end
)
VALUES (
    '2026-2',
    '2026 · Segundo semestre',
    'America/Santiago',
    '2026-12-19'
);

-- Lunes = 1, domingo = 7.
-- Publicamos los apoyos desde el 19 de octubre:
-- no conocemos su fecha original de inicio.
-- La vigencia hasta el 19 de diciembre fue indicada por el usuario.
-- Las ubicaciones quedan pendientes de confirmar.

INSERT INTO weekly_activities (
    id, period_id, name, type, weekday,
    start_time, end_time,
    responsible_name, responsible_role, location,
    valid_from, valid_until
)
VALUES
    (
        'pace-general-1', '2026-2', 'Apoyo general PACE', 'pace', 2,
        '10:30', '11:30',
        'Fabián Suárez', 'student', 'Sala de estudio N.º 7 · Casa Central',
        '2026-10-19', '2026-12-19'
    ),
    (
        'pace-general-2', '2026-2', 'Apoyo general PACE', 'pace', 2,
        '11:30', '12:30',
        'Fabián Suárez', 'student', 'Sala de estudio N.º 7 · Casa Central',
        '2026-10-19', '2026-12-19'
    ),
    (
        'mentoring-calculo', '2026-2', 'Cálculo I', 'mentoring', 3,
        '10:00', '11:00',
        'Felipe Vega', 'professor', 'Sala D02 · Casa Central',
        '2026-10-19', '2026-12-19'
    ),
    (
        'mentoring-fisica', '2026-2', 'Física', 'mentoring', 1,
        '15:00', '16:00',
        'Olver Rodríguez', 'professor', 'Edificio PACE · 4.º piso',
        '2026-10-19', '2026-12-19'
    );

INSERT INTO academic_dates (
    id, period_id, title, starts_on, ends_on, featured, source
)
VALUES
    (
        'career-change-2027-1', '2026-2',
        'Plazo para solicitar cambio de carrera',
        '2026-10-30', '2026-10-30', 0,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    ),
    (
        'withdrawal-2026-2', '2026-2',
        'Plazo para solicitar retiro temporal o definitivo',
        '2026-11-13', '2026-11-13', 0,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    ),
    (
        'integrative-assessments-2026-2', '2026-2',
        'Evaluaciones integrativas',
        '2026-11-23', '2026-12-05', 1,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    ),
    (
        'teaching-survey-2026-2', '2026-2',
        'Encuesta docente',
        '2026-11-23', '2026-12-12', 0,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    ),
    (
        'course-offering-2027-1', '2026-2',
        'Publicación de oferta académica 2027/1',
        '2026-12-09', '2026-12-09', 0,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    ),
    (
        'semester-end-2026-2', '2026-2',
        'Término del segundo semestre',
        '2026-12-19', '2026-12-19', 1,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    ),
    (
        'enrollment-2027', '2026-2',
        'Matrícula de estudiantes antiguos',
        '2026-12-21', '2026-12-31', 0,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    ),
    (
        'course-registration-2027-1', '2026-2',
        'Solicitud de carga académica 2027/1',
        '2026-12-29', '2026-12-30', 1,
        'Calendario académico UCSH 2026 proporcionado por el usuario'
    );
