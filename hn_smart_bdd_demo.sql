--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    emoji text NOT NULL,
    badge_color text DEFAULT 'gray'::text,
    icon text DEFAULT '????'::text
);


ALTER TABLE public.achievements OWNER TO postgres;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_id_seq OWNER TO postgres;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: chatbot_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chatbot_logs (
    id integer NOT NULL,
    user_id integer,
    message text,
    response text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chatbot_logs OWNER TO postgres;

--
-- Name: chatbot_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chatbot_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chatbot_logs_id_seq OWNER TO postgres;

--
-- Name: chatbot_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chatbot_logs_id_seq OWNED BY public.chatbot_logs.id;


--
-- Name: conges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conges (
    id integer NOT NULL,
    employe_id integer NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    type_conge character varying(50),
    statut character varying(20),
    CONSTRAINT conges_statut_check CHECK (((statut)::text = ANY (ARRAY[('Approuv??'::character varying)::text, ('En attente'::character varying)::text, ('Refus??'::character varying)::text])))
);


ALTER TABLE public.conges OWNER TO postgres;

--
-- Name: conges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conges_id_seq OWNER TO postgres;

--
-- Name: conges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conges_id_seq OWNED BY public.conges.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nom character varying(100),
    prenom character varying(100),
    poste character varying(100),
    actif boolean DEFAULT true
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: evenements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evenements (
    id integer NOT NULL,
    employee_id integer,
    titre text NOT NULL,
    date_debut date NOT NULL,
    date_fin date,
    created_at timestamp without time zone DEFAULT now(),
    heure_debut time without time zone,
    heure_fin time without time zone
);


ALTER TABLE public.evenements OWNER TO postgres;

--
-- Name: evenements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evenements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evenements_id_seq OWNER TO postgres;

--
-- Name: evenements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evenements_id_seq OWNED BY public.evenements.id;


--
-- Name: formations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formations (
    id integer NOT NULL,
    code text NOT NULL,
    titre text NOT NULL,
    contenu text NOT NULL
);


ALTER TABLE public.formations OWNER TO postgres;

--
-- Name: formations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formations_id_seq OWNER TO postgres;

--
-- Name: formations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formations_id_seq OWNED BY public.formations.id;


--
-- Name: indicateurs_rh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.indicateurs_rh (
    id integer NOT NULL,
    ponctualite smallint,
    assiduite smallint,
    service_client smallint,
    outils smallint,
    respect_consignes smallint,
    rendement smallint,
    redressements text,
    consequences text,
    date_evaluation date NOT NULL,
    employee_id integer,
    vue boolean DEFAULT false,
    CONSTRAINT indicateurs_rh_assiduite_check CHECK (((assiduite >= 0) AND (assiduite <= 10))),
    CONSTRAINT indicateurs_rh_outils_check CHECK (((outils >= 0) AND (outils <= 10))),
    CONSTRAINT indicateurs_rh_ponctualite_check CHECK (((ponctualite >= 0) AND (ponctualite <= 10))),
    CONSTRAINT indicateurs_rh_rendement_check CHECK (((rendement >= 0) AND (rendement <= 10))),
    CONSTRAINT indicateurs_rh_respect_consignes_check CHECK (((respect_consignes >= 0) AND (respect_consignes <= 10))),
    CONSTRAINT indicateurs_rh_service_client_check CHECK (((service_client >= 0) AND (service_client <= 10)))
);


ALTER TABLE public.indicateurs_rh OWNER TO postgres;

--
-- Name: indicateurs_rh_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.indicateurs_rh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.indicateurs_rh_id_seq OWNER TO postgres;

--
-- Name: indicateurs_rh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.indicateurs_rh_id_seq OWNED BY public.indicateurs_rh.id;


--
-- Name: produits_alimentaires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produits_alimentaires (
    id integer NOT NULL,
    nom text NOT NULL,
    description text
);


ALTER TABLE public.produits_alimentaires OWNER TO postgres;

--
-- Name: produits_alimentaires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.produits_alimentaires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.produits_alimentaires_id_seq OWNER TO postgres;

--
-- Name: produits_alimentaires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.produits_alimentaires_id_seq OWNED BY public.produits_alimentaires.id;


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_questions (
    id integer NOT NULL,
    formation_code text NOT NULL,
    question text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text,
    correct_option character(1) NOT NULL,
    CONSTRAINT quiz_questions_correct_option_check CHECK ((correct_option = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar])))
);


ALTER TABLE public.quiz_questions OWNER TO postgres;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_id_seq OWNER TO postgres;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_questions_id_seq OWNED BY public.quiz_questions.id;


--
-- Name: quiz_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_results (
    id integer NOT NULL,
    formation_code text NOT NULL,
    employee_id integer,
    date_completed timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    score integer NOT NULL
);


ALTER TABLE public.quiz_results OWNER TO postgres;

--
-- Name: quiz_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_results_id_seq OWNER TO postgres;

--
-- Name: quiz_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_results_id_seq OWNED BY public.quiz_results.id;


--
-- Name: televente_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.televente_entries (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    client_number text NOT NULL,
    client_name text NOT NULL,
    product_code text NOT NULL,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    hit_click boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category text DEFAULT 'autres'::text,
    CONSTRAINT televente_entries_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.televente_entries OWNER TO postgres;

--
-- Name: televente_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.televente_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.televente_entries_id_seq OWNER TO postgres;

--
-- Name: televente_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.televente_entries_id_seq OWNED BY public.televente_entries.id;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    employee_id integer,
    achievement_id integer,
    unlocked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_achievements OWNER TO postgres;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_achievements_id_seq OWNER TO postgres;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('User'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: chatbot_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatbot_logs ALTER COLUMN id SET DEFAULT nextval('public.chatbot_logs_id_seq'::regclass);


--
-- Name: conges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conges ALTER COLUMN id SET DEFAULT nextval('public.conges_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: evenements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenements ALTER COLUMN id SET DEFAULT nextval('public.evenements_id_seq'::regclass);


--
-- Name: formations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations ALTER COLUMN id SET DEFAULT nextval('public.formations_id_seq'::regclass);


--
-- Name: indicateurs_rh id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indicateurs_rh ALTER COLUMN id SET DEFAULT nextval('public.indicateurs_rh_id_seq'::regclass);


--
-- Name: produits_alimentaires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produits_alimentaires ALTER COLUMN id SET DEFAULT nextval('public.produits_alimentaires_id_seq'::regclass);


--
-- Name: quiz_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN id SET DEFAULT nextval('public.quiz_questions_id_seq'::regclass);


--
-- Name: quiz_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_results ALTER COLUMN id SET DEFAULT nextval('public.quiz_results_id_seq'::regclass);


--
-- Name: televente_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.televente_entries ALTER COLUMN id SET DEFAULT nextval('public.televente_entries_id_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievements (id, code, name, description, emoji, badge_color, icon) FROM stdin;
3	first_sale	Première vente	Félicitations pour ta première vente !	🎉	green	🏅
4	sales_10	10 ventes	Tu as réalisé 10 ventes !	💼	blue	🏆
\.


--
-- Data for Name: chatbot_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chatbot_logs (id, user_id, message, response, created_at) FROM stdin;
\.


--
-- Data for Name: conges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conges (id, employe_id, date_debut, date_fin, type_conge, statut) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, user_id, nom, prenom, poste, actif) FROM stdin;
7	2	Taylor	Emma	Responsable RH	t
8	3	Martin	Lucas	Télévendeur	t
\.


--
-- Data for Name: evenements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evenements (id, employee_id, titre, date_debut, date_fin, created_at, heure_debut, heure_fin) FROM stdin;
\.


--
-- Data for Name: formations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formations (id, code, titre, contenu) FROM stdin;
1	basic_ops	Basic Operations	Introduction to company systems and tools.
2	crm_101	CRM Usage	How to navigate and use the internal CRM.
3	sales_pro	Sales Basics	Sales communication and pitch techniques.
\.


--
-- Data for Name: indicateurs_rh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.indicateurs_rh (id, ponctualite, assiduite, service_client, outils, respect_consignes, rendement, redressements, consequences, date_evaluation, employee_id, vue) FROM stdin;
\.


--
-- Data for Name: produits_alimentaires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produits_alimentaires (id, nom, description) FROM stdin;
4	Tofu Artisanal	Tofu bio fabriqué localement.
5	Chips de banane plantain	Snacks croustillants et sains.
6	Lait d’amande	Sans sucre ajouté, sans OGM.
7	Protein Bar Z42	High-protein snack bar, gluten-free.
8	Omega Juice X	Fruit juice fortified with Omega-3.
9	NutriMeal Pack	Ready-to-eat meal replacement pack.
10	Protein Bar Z42	High-protein snack bar, gluten-free.
11	Omega Juice X	Fruit juice fortified with Omega-3.
12	NutriMeal Pack	Ready-to-eat meal replacement pack.
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_questions (id, formation_code, question, option_a, option_b, option_c, option_d, correct_option) FROM stdin;
\.


--
-- Data for Name: quiz_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_results (id, formation_code, employee_id, date_completed, score) FROM stdin;
\.


--
-- Data for Name: televente_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.televente_entries (id, employee_id, date, client_number, client_name, product_code, product_name, quantity, hit_click, created_at, category) FROM stdin;
\.


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_achievements (id, employee_id, achievement_id, unlocked_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, created_at) FROM stdin;
1	test_admin	admin123	Admin	2025-07-04 11:15:06.856523
2	emma.taylor	user123	User	2025-07-04 11:15:06.856523
3	lucas.martin	user123	User	2025-07-04 11:15:06.856523
\.


--
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievements_id_seq', 4, true);


--
-- Name: chatbot_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chatbot_logs_id_seq', 1, false);


--
-- Name: conges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conges_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 8, true);


--
-- Name: evenements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evenements_id_seq', 1, false);


--
-- Name: formations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formations_id_seq', 3, true);


--
-- Name: indicateurs_rh_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.indicateurs_rh_id_seq', 1, false);


--
-- Name: produits_alimentaires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produits_alimentaires_id_seq', 12, true);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 1, false);


--
-- Name: quiz_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_results_id_seq', 4, true);


--
-- Name: televente_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.televente_entries_id_seq', 6, true);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: achievements achievements_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_code_key UNIQUE (code);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: chatbot_logs chatbot_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatbot_logs
    ADD CONSTRAINT chatbot_logs_pkey PRIMARY KEY (id);


--
-- Name: conges conges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conges
    ADD CONSTRAINT conges_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: evenements evenements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenements
    ADD CONSTRAINT evenements_pkey PRIMARY KEY (id);


--
-- Name: formations formations_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT formations_code_key UNIQUE (code);


--
-- Name: formations formations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT formations_pkey PRIMARY KEY (id);


--
-- Name: indicateurs_rh indicateurs_rh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indicateurs_rh
    ADD CONSTRAINT indicateurs_rh_pkey PRIMARY KEY (id);


--
-- Name: produits_alimentaires produits_alimentaires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produits_alimentaires
    ADD CONSTRAINT produits_alimentaires_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_results quiz_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_pkey PRIMARY KEY (id);


--
-- Name: televente_entries televente_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.televente_entries
    ADD CONSTRAINT televente_entries_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_employee_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_employee_id_achievement_id_key UNIQUE (employee_id, achievement_id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: ix_conges_employe_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conges_employe_id ON public.conges USING btree (employe_id);


--
-- Name: conges conges_employe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conges
    ADD CONSTRAINT conges_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: evenements evenements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenements
    ADD CONSTRAINT evenements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: indicateurs_rh fk_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indicateurs_rh
    ADD CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: quiz_questions quiz_questions_formation_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_formation_code_fkey FOREIGN KEY (formation_code) REFERENCES public.formations(code) ON UPDATE CASCADE;


--
-- Name: quiz_results quiz_results_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: quiz_results quiz_results_formation_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_formation_code_fkey FOREIGN KEY (formation_code) REFERENCES public.formations(code);


--
-- Name: televente_entries televente_entries_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.televente_entries
    ADD CONSTRAINT televente_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

