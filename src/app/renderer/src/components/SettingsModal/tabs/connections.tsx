"use client";

import { Header, Separator, Setting } from "../components";
import Tooltip from "@/components/Tooltip";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { XMarkIcon } from "@heroicons/react/24/outline";
import FormModal from "@/components/FormModal";
import React from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { notify } from "@/lib/notifications";
import { ProviderAPI, providers } from "@/lib/providers";
import { ExternalAccount, ImportMethod, MediaType } from "@/lib/db/types";
import { useMessages } from "@/lib/messages";
import { InputType } from "@/lib/forms";
import { open } from "@tauri-apps/api/shell";
import * as crypto from "crypto";

export default function Connections() {
    const m = useMessages();
    const accounts = useLiveQuery(() => db.externalAccounts.toArray());

    return (
        <>
            <Header
                title={m("settings_connections_title")}
                subtitle={m("settings_connections_subtitle")}
            />
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded p-2 text-sm text-yellow-400">
                <div>{m("settings_connections_warning")}</div>
            </div>
            <Setting
                title={m("settings_connections_connectaccount_title")}
                info={m("settings_connections_connectaccount_info")}
                orientation="vertical"
            >
                <div className="flex flex-row flex-wrap gap-2 -mb-2">
                    {Object.getOwnPropertyNames(providers).map(
                        (key: string, index: number) => (
                            <ProviderButton
                                key={index}
                                code={key as keyof typeof providers}
                                checked={
                                    accounts
                                        ? accounts.filter(
                                              (account: ExternalAccount) =>
                                                  account.provider === key &&
                                                  account.user
                                          ).length > 0
                                        : false
                                }
                            />
                        )
                    )}
                </div>
            </Setting>
            <Separator />
            <div className="flex flex-col items-stretch gap-4 flex-1">
                {!!accounts && accounts?.length > 0 ? (
                    accounts.map((account) => (
                        <Account key={account.id} account={account} />
                    ))
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-zinc-300 text-base p-4 rounded-lg bg-zinc-850">
                        <div className="mb-1 text-sm">(⊙.☉)7</div>
                        <div className="text-sm">
                            {m(
                                "settings_connections_connectedaccounts_empty_title"
                            )}
                        </div>
                        <div className="opacity-50 text-xs">
                            {m(
                                "settings_connections_connectedaccounts_empty_subtitle"
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function ProviderButton({
    code,
    checked,
}: {
    code: keyof typeof providers;
    checked: boolean;
}) {
    const provider = providers[code];

    return (
        <Tooltip label={provider.name} position="top" spacing={0.5}>
            <button
                onClick={async () => {
                    await db.externalAccounts.add(
                        ExternalAccount.create({
                            provider: code,
                        })
                    );
                }}
                className="hover:scale-105 active:scale-110 transition-all ease-out relative"
            >
                <img
                    src={`/providers/${code}/icon.png`}
                    className="h-8 w-8 object-cover object-center rounded"
                />
                {checked && (
                    <CheckCircleIcon className="h-4 w-4 absolute -top-2 -right-2 fill-green-400" />
                )}
            </button>
        </Tooltip>
    );
}

function Account({ account }: { account: ExternalAccount }) {
    const m = useMessages();
    const api = new ProviderAPI(account.provider);

    const [isConnectAccountModalOpen, setIsConnectAccountModalOpen] =
        React.useState(false);
    const [
        isSelectListTypeImportModalOpen,
        setIsSelectListTypeImportModalOpen,
    ] = React.useState(false);

    function Button({
        children,
        ...props
    }: {
        children: React.ReactNode;
        [key: string]: any;
    }) {
        return (
            <button
                className="leading-none text-sm p-2 rounded bg-zinc-700/50 hover:bg-zinc-600/50 transition text-zinc-300 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-zinc-700/50"
                {...props}
            >
                {children}
            </button>
        );
    }

    return (
        <>
            <div className="rounded overflow-hidden">
                <div className="flex flex-row items-center justify-between p-2 leading-none bg-zinc-900">
                    <div className="flex flex-row items-center gap-4">
                        <img
                            src={`/providers/${String(
                                account.provider
                            )}/icon.png`}
                            className="rounded h-6 w-6 object-center object-cover"
                        />
                        <div className="text-zinc-300">
                            {account.user?.name ||
                                account.auth?.username ||
                                api.name}
                        </div>
                    </div>
                    <button
                        className="p-2 -m-2"
                        onClick={async () => {
                            await db.externalAccounts.delete(account.id!);
                        }}
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
                <div className="bg-zinc-850 p-2">
                    <div className="flex flex-row items-center justify-between text-sm leading-none gap-4">
                        <div className="flex flex-row items-center gap-2">
                            <Button
                                onClick={() => {
                                    setIsConnectAccountModalOpen(true);
                                }}
                            >
                                {account.isAuthed
                                    ? m(
                                          "settings_connections_account_reconnect"
                                      )
                                    : m("settings_connections_account_connect")}
                            </Button>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <Button
                                disabled={
                                    !account.isAuthed ||
                                    api.config.syncing?.mediaTypes
                                        .length === 0
                                }
                                onClick={(e: any) => {
                                    if (e.target.disabled) return;
                                    setIsSelectListTypeImportModalOpen(true);
                                }}
                            >
                                {m("settings_connections_account_import")}
                            </Button>
                            <Button disabled={true}>
                                {m("settings_connections_account_export")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {api.config.syncing?.authType === "username" ? (
                <ConnectAccountUsernameModal
                    isOpen={isConnectAccountModalOpen}
                    closeModal={() => setIsConnectAccountModalOpen(false)}
                    account={account}
                    providerAPI={api}
                />
            ) : (
                <ConnectAccountOAuthModal
                    isOpen={isConnectAccountModalOpen}
                    closeModal={() => setIsConnectAccountModalOpen(false)}
                    account={account}
                    providerAPI={api}
                />
            )}
            <FormModal
                isOpen={isSelectListTypeImportModalOpen}
                closeModal={() => setIsSelectListTypeImportModalOpen(false)}
                steps={[
                    {
                        title: m("settings_connections_connect_import_title"),
                        subtitle: m(
                            "settings_connections_connect_import_subtitle",
                            {
                                provider: api.name,
                            }
                        ),
                        fields: [
                            {
                                type: InputType.RadioGroup,
                                name: "type",
                                label: "Type",
                                required: true,
                                options: [
                                    ...(api.config.syncing?.mediaTypes.includes(
                                        "anime"
                                    )
                                        ? [
                                              {
                                                  value: "anime",
                                                  label: m(
                                                      "settings_connections_connect_import_anime_title"
                                                  ),
                                                  description: m(
                                                      "settings_connections_connect_import_anime_description",
                                                      {
                                                          provider: api.name,
                                                      }
                                                  ),
                                              },
                                          ]
                                        : []),
                                    ...(api.config.syncing?.mediaTypes.includes(
                                        "manga"
                                    )
                                        ? [
                                              {
                                                  value: "manga",
                                                  label: m(
                                                      "settings_connections_connect_import_manga_title"
                                                  ),
                                                  description: m(
                                                      "settings_connections_connect_import_manga_description",
                                                      {
                                                          provider: api.name,
                                                      }
                                                  ),
                                              },
                                          ]
                                        : []),
                                ],
                            },
                        ],
                    },
                    {
                        title: "Select the import method",
                        subtitle:
                            "How do you want your library to be imported?",
                        fields: [
                            {
                                type: InputType.RadioGroup,
                                name: "method",
                                label: "Method",
                                required: true,
                                defaultValue: "merge",
                                options: [
                                    {
                                        value: "merge",
                                        label: m(
                                            "settings_connections_connect_import_merge_title"
                                        ),
                                        description: m(
                                            "settings_connections_connect_import_merge_description"
                                        ),
                                    },
                                    {
                                        value: "override",
                                        label: m(
                                            "settings_connections_connect_import_override_title"
                                        ),
                                        description: m(
                                            "settings_connections_connect_import_override_description"
                                        ),
                                    },
                                    {
                                        value: "keep",
                                        label: m(
                                            "settings_connections_connect_import_keep_title"
                                        ),
                                        description: m(
                                            "settings_connections_connect_import_keep_description"
                                        ),
                                    },
                                    {
                                        value: "latest",
                                        label: m(
                                            "settings_connections_connect_import_latest_title"
                                        ),
                                        description: m(
                                            "settings_connections_connect_import_latest_description"
                                        ),
                                    },
                                ],
                            },
                        ],
                    },
                ]}
                onSubmit={({ type, method }) => {
                    account
                        .importLibrary(
                            type as MediaType,
                            method as ImportMethod
                        )
                        .then(() => {
                            notify({
                                title: m(
                                    "settings_connections_connect_import_success_title",
                                    {
                                        username: account.user!.name,
                                        type,
                                    }
                                ),
                                body: m(
                                    "settings_connections_connect_import_success_body",
                                    {
                                        provider: api.name,
                                    }
                                ),
                            });
                        })
                        .catch((e) => {
                            console.error(e);
                            notify({
                                title: m(
                                    "settings_connections_connect_import_failure_title",
                                    {
                                        provider: api.name,
                                        type,
                                    }
                                ),
                                body: m(
                                    "settings_connections_connect_import_failure_body"
                                ),
                            });
                        });
                }}
            />
        </>
    );
}

function ConnectAccountUsernameModal({
    isOpen,
    closeModal,
    account,
    providerAPI,
}: {
    isOpen: boolean;
    closeModal: () => void;
    account: ExternalAccount;
    providerAPI: ProviderAPI;
}) {
    const m = useMessages();

    return (
        <FormModal
            isOpen={isOpen}
            closeModal={closeModal}
            steps={[
                {
                    title: m("settings_connections_connect_username_title", {
                        provider: providerAPI.name,
                    }),
                    subtitle: m(
                        "settings_connections_connect_username_subtitle"
                    ),
                    fields: [
                        {
                            type: InputType.Text,
                            name: "username",
                            label: m(
                                "settings_connections_connect_username_username"
                            ),
                            defaultValue: account.auth?.username || "",
                        },
                    ],
                },
            ]}
            onSubmit={(props) => {
                account.authorize(props);
            }}
        />
    );
}

function ConnectAccountOAuthModal({
    isOpen,
    closeModal,
    account,
    providerAPI,
}: {
    isOpen: boolean;
    closeModal: () => void;
    account: ExternalAccount;
    providerAPI: ProviderAPI;
}) {
    const m = useMessages();

    React.useEffect(() => {
        if (isOpen) {
            const key = crypto.randomBytes(32).toString("hex");
            const iv = crypto.randomBytes(16).toString("hex");

            sessionStorage.setItem(
                `Naoka:Provider:${providerAPI.name}:OAuthKey`,
                key
            );
            sessionStorage.setItem(
                `Naoka:Provider:${providerAPI.name}:OAuthIV`,
                iv
            );

            open(
                `https://naoka.nyeki.dev/api/auth/oauth2/${
                    providerAPI.code
                }?key=${encodeURIComponent(key)}&iv=${encodeURIComponent(iv)}`
            );
        }
    }, [isOpen]);

    return (
        <FormModal
            isOpen={isOpen}
            closeModal={closeModal}
            steps={[
                {
                    title: m("settings_connections_connect_oauth_title", {
                        provider: providerAPI.name,
                    }),
                    subtitle: m("settings_connections_connect_oauth_subtitle"),
                    fields: [
                        {
                            type: InputType.Text,
                            name: "code",
                            label: m("settings_connections_connect_oauth_code"),
                            defaultValue: account.auth?.username || "",
                        },
                    ],
                },
            ]}
            onSubmit={(props) => {
                account.authorize(props);
            }}
        />
    );
}
