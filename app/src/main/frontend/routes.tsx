import LoginView from "Frontend/views/LoginView";
import MainLayout from "Frontend/views/MainLayout";
import HomeView from "Frontend/views/HomeView";
import SetupView from "Frontend/views/SetupView";
import i18n from "Frontend/i18n";
import {ThemeSelector} from "Frontend/components/theming/ThemeSelector";
import App from "Frontend/App";
import {LibraryManagement} from "Frontend/components/administration/LibraryManagement";
import {UserManagement} from "Frontend/components/administration/UserManagement";
import ProfileManagement from "Frontend/components/administration/ProfileManagement";
import {SsoManagement} from "Frontend/components/administration/SsoManagement";
import {AdministrationView} from "Frontend/views/AdministrationView";
import {ProfileView} from "Frontend/views/ProfileView";
import {MessageManagement} from "Frontend/components/administration/MessageManagement";
import {LogManagement} from "Frontend/components/administration/LogManagement";
import PasswordResetView from "Frontend/views/PasswordResetView";
import EmailConfirmationView from "Frontend/views/EmailConfirmationView";
import InvitationRegistrationView from "Frontend/views/InvitationRegistrationView";
import PluginManagement from "Frontend/components/administration/PluginManagement";
import {SystemManagement} from "Frontend/components/administration/SystemManagement";
import GameView from "Frontend/views/GameView";
import LibraryManagementView from "Frontend/views/LibraryManagementView";
import SearchView from "Frontend/views/SearchView";
import RecentlyAddedView from "Frontend/views/RecentlyAddedView";
import LibraryView from "Frontend/views/LibraryView";
import {RouterConfigurationBuilder} from "@vaadin/hilla-file-router/runtime.js";
import ErrorView from "Frontend/views/ErrorView";
import GameRequestView from "Frontend/views/GameRequestView";
import {GameRequestManagement} from "Frontend/components/administration/GameRequestManagement";
import {DownloadManagement} from "Frontend/components/administration/DownloadManagement";

export const {router, routes} = new RouterConfigurationBuilder()
    .withReactRoutes([
        {
            element: <App/>,
            children: [
                {
                    element: <MainLayout/>,
                    children: [
                        {
                            index: true,
                            element: <HomeView/>
                        },
                        {
                            path: 'search',
                            element: <SearchView/>,
                            handle: {title: () => i18n.t('routes.search')}
                        },
                        {
                            path: 'recently-added',
                            element: <RecentlyAddedView/>,
                            handle: {title: () => i18n.t('routes.recentlyAdded')}
                        },
                        {
                            path: '/requests',
                            element: <GameRequestView/>,
                            handle: {title: () => i18n.t('routes.requests')}
                        },
                        {
                            path: 'library/:libraryId',
                            element: <LibraryView/>
                        },
                        {
                            path: 'game/:gameId',
                            element: <GameView/>
                        },
                        {
                            path: 'settings',
                            element: <ProfileView/>,
                            handle: {title: () => i18n.t('routes.profile')},
                            children: [
                                {
                                    path: 'profile',
                                    element: <ProfileManagement/>,
                                    handle: {title: () => i18n.t('routes.profileSettings')}
                                },
                                {
                                    path: 'appearance',
                                    element: <ThemeSelector/>,
                                    handle: {title: () => i18n.t('routes.appearance')}
                                }
                            ]
                        },
                        {
                            path: 'administration',
                            element: <AdministrationView/>,
                            handle: {title: () => i18n.t('routes.administration')},
                            children: [
                                {
                                    path: 'libraries',
                                    element: <LibraryManagement/>,
                                    handle: {title: () => i18n.t('routes.adminLibraries')}
                                },
                                {
                                    path: 'libraries/library/:libraryId',
                                    element: <LibraryManagementView/>,
                                    handle: {title: () => i18n.t('routes.adminLibrary')}
                                },
                                {
                                    path: 'requests',
                                    element: <GameRequestManagement/>,
                                    handle: {title: () => i18n.t('routes.adminRequests')}
                                },
                                {
                                    path: 'downloads',
                                    element: <DownloadManagement/>,
                                    handle: {title: () => i18n.t('routes.adminDownloads')}
                                },
                                {
                                    path: 'users',
                                    element: <UserManagement/>,
                                    handle: {title: () => i18n.t('routes.adminUsers')}
                                },
                                {
                                    path: 'sso',
                                    element: <SsoManagement/>,
                                    handle: {title: () => i18n.t('routes.adminSSO')}
                                },
                                {
                                    path: 'messages',
                                    element: <MessageManagement/>,
                                    handle: {title: () => i18n.t('routes.adminMessages')}
                                },
                                {
                                    path: 'plugins',
                                    element: <PluginManagement/>,
                                    handle: {title: () => i18n.t('routes.adminPlugins')}
                                },
                                {
                                    path: 'logs',
                                    element: <LogManagement/>,
                                    handle: {title: () => i18n.t('routes.adminLogs')}
                                },
                                {
                                    path: 'system',
                                    element: <SystemManagement/>,
                                    handle: {title: () => i18n.t('routes.adminSystem')}
                                }
                            ]
                        }
                    ]
                },
                {
                    path: 'login',
                    element: <LoginView/>,
                    handle: {title: () => i18n.t('routes.login')}
                },
                {
                    path: 'setup',
                    element: <SetupView/>,
                    handle: {title: () => i18n.t('routes.setup')}
                },
                {
                    path: 'accept-invitation',
                    element: <InvitationRegistrationView/>,
                    handle: {title: () => i18n.t('routes.invitation')}
                },
                {
                    path: 'reset-password',
                    element: <PasswordResetView/>,
                    handle: {title: () => i18n.t('routes.resetPassword')}
                },
                {
                    path: 'confirm-email',
                    element: <EmailConfirmationView/>,
                    handle: {title: () => i18n.t('routes.confirmEmail')}
                },
                {
                    path: '*',
                    element: <ErrorView/>,
                    handle: {title: () => i18n.t('routes.error')}
                }
            ]
        }
    ])
    .protect("/login")
    .build();
