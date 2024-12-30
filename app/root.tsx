import { useStore } from '@nanostores/react';
import type { LinksFunction, LoaderFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import type { SerializeFrom } from '@remix-run/cloudflare';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';
import 'virtual:uno.css';
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp } from "@clerk/remix";

export const links: LinksFunction = () => [
	{
		rel: 'icon',
		href: '/favicon.svg',
		type: 'image/svg+xml',
	},
	{ rel: 'stylesheet', href: reactToastifyStyles },
	{ rel: 'stylesheet', href: tailwindReset },
	{ rel: 'stylesheet', href: globalStyles },
	{ rel: 'stylesheet', href: xtermStyles },
	{
		rel: 'preconnect',
		href: 'https://fonts.googleapis.com',
	},
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
	},
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
	<>
		<meta charSet="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<Meta />
		<Links />
		<script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
	</>
));

export function Layout({ children }: { children: React.ReactNode }) {
	const theme = useStore(themeStore);

	useEffect(() => {
		document.querySelector('html')?.setAttribute('data-theme', theme);
	}, [theme]);

	return (
		<>
			{children}
			<ScrollRestoration />
			<Scripts />
		</>
	);
}

import { logStore } from './lib/stores/logs';
interface LoaderData {
	sessionId: string | null;
	userId: string | null;
	getToken: (() => Promise<string>) | null;
}

export const loader: LoaderFunction = args => {
	return rootAuthLoader(args, ({ request }) => {
		const { sessionId, userId, getToken } = request.auth;
		return { sessionId, userId };
	});
};

const App = () => {
	const theme = useStore(themeStore);
	const { sessionId, userId } = useLoaderData<SerializeFrom<LoaderData>>();

	useEffect(() => {
		logStore.logSystem('Application initialized', {
			theme,
			sessionId,
			userId,
			platform: navigator.platform,
			userAgent: navigator.userAgent,
			timestamp: new Date().toISOString(),
		});
	}, [sessionId, userId]);

	return (
		<Layout>
			<Outlet />
		</Layout>
	);
}

export default ClerkApp(App);
