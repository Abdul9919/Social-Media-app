--
-- PostgreSQL database dump
--

\restrict 0U1k4UNRZ8RoIZXfeB5FrT59T3R4kx72aNybaNXTJvEhJbykUIAbnYB5FQ5PiSZ

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-2.pgdg13+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: comment_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment_likes (
    comment_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comment_likes OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id integer NOT NULL,
    likes integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: followers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.followers (
    followed_by integer NOT NULL,
    following integer NOT NULL
);


ALTER TABLE public.followers OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    media_url text NOT NULL,
    media_type character varying(10),
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    CONSTRAINT posts_media_type_check CHECK (((media_type)::text = ANY (ARRAY[('image'::character varying)::text, ('video'::character varying)::text])))
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    profile_picture character varying(255) DEFAULT 'https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg'::character varying
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
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
08df1add-db52-434a-b06f-4b10195625bf	0565346a7d3bb743c5bc295267d04c2f7296e55084ab60847454a1c370696d61	2026-01-27 15:19:56.780605+00	0_init		\N	2026-01-27 15:19:56.780605+00	0
\.


--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comment_likes (comment_id, user_id, created_at) FROM stdin;
37	3	2026-01-28 15:10:25.212
36	3	2026-01-28 15:12:22.971
35	3	2026-01-28 15:12:52.362
74	3	2026-01-28 15:45:05.27
31	3	2026-01-28 15:45:14.133
73	3	2026-01-29 11:07:42.949
74	5	2026-04-07 06:50:07.153
34	5	2026-04-07 06:50:11.523
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (post_id, user_id, content, created_at, id, likes) FROM stdin;
8	3	testing comment	2025-07-01 22:06:13.088085	1	0
8	3	testing	2025-07-01 22:06:28.890754	2	0
8	3	testing comment	2025-07-01 22:10:06.957341	3	0
8	3	testing comment	2025-07-02 09:38:35.199564	4	0
8	3	testing comment	2025-07-02 09:38:44.312774	5	0
7	3	testing reel comment	2025-07-02 10:32:23.574575	6	0
7	3	testing again	2025-07-02 10:32:59.356114	7	0
6	3	comment is working maybe?	2025-07-02 10:34:47.762133	8	0
6	3	is it working better now?	2025-07-02 10:37:41.752967	9	0
7	3	i hope this is working without any bug now	2025-07-02 10:39:15.226661	10	0
7	3	will it work better without any bugs#2?	2025-07-02 10:40:32.182483	11	0
8	3	adding	2025-07-02 10:50:18.386878	12	0
8	3	more	2025-07-02 10:50:19.197528	13	0
8	3	comments	2025-07-02 10:50:20.290477	14	0
8	3	to	2025-07-02 10:50:20.887512	15	0
8	3	test	2025-07-02 10:50:21.545367	16	0
8	3	overflow	2025-07-02 10:50:22.748313	17	0
8	3	still wroking?	2025-07-02 11:19:14.76189	18	0
8	3	testing again	2025-07-02 11:20:36.241849	19	0
8	3	testing if refresh works and also jjjjjjuuuuuussssttt makiiiinnngg thhheee coommmmennnt long toooo testt overflowwww	2025-07-02 11:22:07.690665	20	0
7	3	guria ki comme nt	2025-07-02 12:09:31.180254	21	0
7	3	🤣🤣	2025-07-02 13:01:17.485919	22	0
12	3	is like system working?	2025-07-04 05:39:39.701414	23	0
12	3	i hope so	2025-07-04 05:42:38.101116	24	0
12	3	testing bug	2025-07-04 05:47:49.781975	25	0
12	1	working?	2025-07-04 05:48:31.313302	26	0
12	2	lets hope this works bruh	2025-07-04 05:49:14.963137	27	0
12	2	asdf	2025-07-04 06:18:29.324722	28	0
12	2	testing useRef	2025-07-04 06:19:06.157211	29	0
12	2	testing post useRef	2025-07-04 06:21:13.141706	30	0
12	3	lets hope its working now #3	2025-07-11 06:29:42.765174	32	0
12	3	lets hope its working now #4	2025-07-11 06:30:26.972682	33	0
10	3	is useQuery working?	2025-07-13 15:36:10.81676	64	0
10	3	is query working #3?	2025-07-13 15:39:43.276167	66	0
10	3	is query working #4?	2025-07-13 15:40:15.464036	67	0
10	3	is postQuery working #5?	2025-07-13 15:42:05.548451	68	0
10	3	is postquery working #6	2025-07-14 15:56:14.30437	69	0
10	3	is postquery working #7	2025-07-14 16:10:07.565081	70	0
10	3	is post query working#8?	2025-07-14 16:16:59.585345	71	0
10	3	is postquery working #9	2025-07-14 16:17:10.866633	72	0
12	3	lets hope its working now #8	2025-07-11 06:42:41.883245	37	1
12	3	lets hope its working now #7	2025-07-11 06:42:20.14301	36	1
12	3	lets hope its working now #6	2025-07-11 06:34:40.256701	35	1
12	3	is comment working	2025-07-11 06:15:00.006638	31	1
12	3	is usequery working #2?	2025-07-13 15:38:05.184854	65	0
12	3	i hope this works	2025-07-15 09:38:23.253183	73	1
12	3	abcdefg   hijkl mnop   qrstuv  wwwrsisjausdhfuiashf	2026-01-28 12:25:21.118637	74	2
12	3	lets hope its working now #5	2025-07-11 06:34:21.626604	34	1
\.


--
-- Data for Name: followers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.followers (followed_by, following) FROM stdin;
2	4
2	5
2	8
2	7
2	6
2	1
2	3
3	3
3	2
5	2
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (post_id, user_id, created_at) FROM stdin;
7	2	2025-07-01 17:17:54.349432
7	1	2025-07-01 17:18:35.627092
8	1	2025-07-01 17:18:37.671623
8	3	2025-07-02 14:48:48.354052
12	2	2025-07-04 05:39:51.40707
7	4	2025-07-06 14:54:24.022996
7	5	2025-07-06 14:54:36.394513
7	7	2025-07-07 09:43:00.641407
7	6	2025-07-07 09:43:13.703044
7	8	2025-07-07 09:46:15.923264
7	3	2025-07-12 04:17:54.47034
8	2	2025-07-12 09:46:51.748931
10	3	2025-07-13 09:44:12.2591
6	3	2025-07-13 09:58:23.040445
12	3	2025-07-15 09:27:21.982619
10	2	2025-07-20 16:01:26.516173
6	2	2025-08-02 11:26:32.041337
12	5	2026-04-07 06:49:58.135715
10	5	2026-04-07 06:50:00.662323
6	5	2026-04-07 06:50:19.731984
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, user_id, created_at, description, media_url, media_type, likes, comments) FROM stdin;
7	2	2025-07-01 11:39:21.149606	testing the route	https://res.cloudinary.com/dv9af2izq/video/upload/v1751351971/posts/2cc0aaa9548ccc95c291369daa4ddfb1_2_2025-07-01.mp4	video	0	0
6	2	2025-07-01 11:37:45.157127	testing the route	https://res.cloudinary.com/dv9af2izq/image/upload/v1751351784/posts/3f8330c6736c982837e7c037b8c08362_2_2025-07-01.png	image	0	0
8	2	2025-07-01 12:41:10.298407	testing the route again	https://res.cloudinary.com/dv9af2izq/image/upload/v1751355682/posts/6e6448b7fb9c347dd0357cd19dcc7a52_2_2025-07-01.png	image	0	0
10	3	2025-07-03 14:56:22.042996	post number 5	https://res.cloudinary.com/dv9af2izq/image/upload/v1751554602/posts/edf6277280b3d6be43ef4f8e05ce92cb_3_2025-07-03.png	image	0	0
12	3	2025-07-03 15:06:51.158198	post number 7	https://res.cloudinary.com/dv9af2izq/image/upload/v1751555231/posts/64e570fa82b3a0a46a88458f55406561_3_2025-07-03.png	image	0	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, updated_at, profile_picture) FROM stdin;
3	parky2552	parky2552@gmail.com	$2b$10$R0i5MyvFTNF5KR1XK92Lu.MbDlMdg9/EmZAS8TL7hRtRGEAR0MoFS	2025-06-26 14:09:05.071993+00	2025-06-26 14:09:05.071993+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751286611/3_aj6flp.jpg
2	abdul	abdul@abdul.com	$2b$10$Gw1c5ZsDK9nhCe0p8XIw6.Sqpn6GkBorUgWMzSDHXGfLJfQrP7UIS	2025-06-23 15:31:12.536934+00	2025-06-23 15:31:12.536934+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751349452/profile_pictures/2.png
1	abdul9919	abdul9919@abdul.com	$2b$10$/cBeUM0tAZ6Mbpt.6vJ5bOj32O/GcGM4tgfs3OMRuw3c1Dcaq3J8i	2025-06-16 13:23:13.704263+00	2025-06-16 13:23:13.704263+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg
4	Abdul Rahman	bebacheno@hotmail.com	$2b$10$RaMSz3obJILVkcd/vT3NDOHbjQ0sk7i.l5dcsXymkg8AMgmeEnohW	2025-07-04 09:14:10.538344+00	2025-07-04 09:14:10.538344+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg
5	test	test@test.com	$2b$10$Y8Y7/GVV0fEjxckhB5N5I./98hjUJaWbGxrM2WHVibl6QH3JYkbMK	2025-07-04 09:43:03.84939+00	2025-07-04 09:43:03.84939+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg
6	test2	test2@test.com	$2b$10$KnWhmRk0FUOke6.p8VbzXu66i9l3/36AHxO9l0KosMVBWnAHOlABi	2025-07-07 09:40:04.517129+00	2025-07-07 09:40:04.517129+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg
7	test3	test3@test.com	$2b$10$CmJHla9BeuMPQX63xDMIbepFU/ojn8IjtSKdSAYddgkNR5MoR6/gG	2025-07-07 09:41:40.96786+00	2025-07-07 09:41:40.96786+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg
8	test4	test4@test.com	$2b$10$WvHXRu30RQ3phHVHBZlwoedGWJXWv422pF4vG5xIexe4YEEQ4E3D6	2025-07-07 09:46:04.843746+00	2025-07-07 09:46:04.843746+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg
39	Guria	guria@guria.com	$2b$10$PCcj3ee3EVb59/J6QQsPteB7bUsOgg2MDdv.4QyPOkpbSA5qls0aS	2026-02-22 03:04:00.578359+00	2026-02-22 03:04:00.578359+00	https://res.cloudinary.com/dv9af2izq/image/upload/v1751620689/default-profile-picture_jirerm.jpg
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 74, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 39, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: comment_likes comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (user_id, comment_id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: followers followers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_pkey PRIMARY KEY (followed_by, following);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (user_id, post_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


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
-- Name: comment_likes_comment_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comment_likes_comment_id_idx ON public.comment_likes USING btree (comment_id);


--
-- Name: comment_likes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comment_likes_user_id_idx ON public.comment_likes USING btree (user_id);


--
-- Name: comments_post_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comments_post_id_idx ON public.comments USING btree (post_id);


--
-- Name: comments_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comments_user_id_idx ON public.comments USING btree (user_id);


--
-- Name: followers_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX followers_user_id ON public.followers USING btree (following, followed_by);


--
-- Name: followers_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX followers_user_id_idx ON public.users USING btree (id);


--
-- Name: idx_comments_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: idx_likes_post_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_post_id ON public.likes USING btree (post_id);


--
-- Name: idx_likes_post_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_likes_post_user ON public.likes USING btree (post_id, user_id);


--
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at);


--
-- Name: idx_posts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);


--
-- Name: likes_post_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_post_id_idx ON public.likes USING btree (post_id);


--
-- Name: likes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_user_id_idx ON public.likes USING btree (user_id);


--
-- Name: posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_id_idx ON public.posts USING btree (id);


--
-- Name: posts_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_user_id_idx ON public.posts USING btree (user_id);


--
-- Name: comment_likes comment_likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_likes comment_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: followers followers_followed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_followed_by_fkey FOREIGN KEY (followed_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: followers followers_following_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_following_fkey FOREIGN KEY (following) REFERENCES public.users(id);


--
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 0U1k4UNRZ8RoIZXfeB5FrT59T3R4kx72aNybaNXTJvEhJbykUIAbnYB5FQ5PiSZ

