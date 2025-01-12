import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx"
import { z } from "zod"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Toaster } from "@/components/ui/toaster"
import {toast} from "@/hooks/use-toast.ts";
import {useEffect, useState} from "react";
import Spinner from "@/components/ui/spinner.tsx";
import { invoke } from '@tauri-apps/api/core';
import {commitSession, fetchSession} from "@/services/auth-service.ts";
import {useNavigate} from "react-router";
import {User, Key} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox.tsx";
import useTranslation from "@/hooks/use-translation.tsx";
import UpdateDialog from "@/components/dialog/update-dialog.tsx";

const formSchema = z.object({
    login: z.string()
        .min(4, { message: "Логин должен быть длинее 4 символов" })
        .max(12, { message: "Логин должен быть короче 12 символов" }),

    password: z.string()
        .min(6, { message: "Пароль должен быть длинее 6 символов" })
        .max(16, { message: "Пароль должен быть короче 16 символов" }),

    keep: z.boolean()
})

function LoginPage() {
    const { getString } = useTranslation();
    const [isAuthorizing, setIsAuthorizing] =useState<boolean>(false);
    const [isRequesting, setIsRequesting] = useState<boolean>(false);
    const [checkUpdatesIsCompleted, setCheckUpdatesIsCompleted] = useState<boolean>(false);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            login: "",
            password: "",
            keep: false
        }
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsRequesting(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
            let hash: string = await invoke("get_sha256", { "data": data.password })
            let session = await fetchSession(data.login, hash);
            if (!session.commited) {
                let hwid: string = await invoke("get_hwid");
                session = await commitSession(session.token, hwid);
            }
            if (!session.commited)
                throw Error("Идентификатор устройства не совпадает");
            if (data.keep)
                await invoke("write_session", { "session": session.token });
            navigate("/loader", { state: { session: session.token } });
        } catch (e) {
            toast({
                title: "Exception",
                // @ts-ignore
                description: e.message,
                variant: "destructive"
            });
        }
        setIsRequesting(false);
    }

    async function tryAuthorize() {
        setIsAuthorizing(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
            const sessionToken: string = await invoke("get_session");
            if (sessionToken == "undefined") {
                setIsAuthorizing(false);
                return;
            }
            const hwid: string = await invoke("get_hwid");
            const session = await commitSession(sessionToken, hwid);
            if (session.commited) navigate("/loader", { state: { session: session.token } })
        } catch { }
        setIsAuthorizing(false);
    }

    useEffect(() => {
        if (checkUpdatesIsCompleted)
            tryAuthorize();
    }, [checkUpdatesIsCompleted]);

    return (
        <>
            {
                isAuthorizing ?
                    <div className="dark bg-background text-foreground font-inter w-full h-screen flex items-center justify-center">
                        <div className="w-full h-full flex items-center text-gray-400 gap-3 justify-center">
                            <Spinner />
                        </div>
                    </div>
                    :
                    <div className="dark bg-background text-foreground font-inter w-full h-screen flex items-center justify-center">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <Card className="mb-[30px] border-none rounded-3xl max-w-[400px] bg-slate-900">
                                    <CardHeader>
                                        <CardTitle>{getString("login-title")}</CardTitle>
                                        <CardDescription>{getString("login-description")}</CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex flex-col gap-5">
                                            <FormField name="login" render={({ field }) => (
                                                           <FormItem>
                                                               <FormControl>
                                                                   <Input autoComplete="off" className="rounded-3xl p-1" icon={<User width={20} height={20} />} placeholder={getString("login-input-login")} {...field} />
                                                               </FormControl>
                                                               <FormMessage />
                                                           </FormItem>
                                                       )} />

                                            <FormField name="password" render={({ field }) => (
                                                           <FormItem>
                                                               <FormControl>
                                                                   <Input autoComplete="off" className="rounded-3xl p-1" icon={<Key width={20} height={20} />} type="password" placeholder={getString("login-input-pass")} {...field}/>
                                                               </FormControl>
                                                               <FormMessage />
                                                           </FormItem>
                                                       )} />

                                            <FormField name="keep" render={({ field }) => (
                                                           <FormItem>
                                                               <div className="flex gap-2 px-1 items-center justify-start">
                                                                   <FormControl>
                                                                       <Checkbox
                                                                           className="rounded-3xl"
                                                                           checked={field.value}
                                                                           onCheckedChange={field.onChange}
                                                                       />
                                                                  </FormControl>
                                                                  <div className="space-y-1 leading-none text-gray-400">
                                                                      <FormLabel>
                                                                          {getString("login-keep")}
                                                                      </FormLabel>
                                                                  </div>
                                                               </div>
                                                               <FormMessage />
                                                           </FormItem>
                                                       )} />
                                        </div>
                                    </CardContent>

                                    <CardFooter>
                                        <div className="flex flex-col gap-2 w-full">
                                            <Button className="text-white rounded-3xl h-[40px] text-[16px]" disabled={isRequesting} type="submit">
                                                {
                                                    isRequesting ? <Spinner /> : getString("login-button")
                                                }
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </form>
                        </Form>

                        <Toaster />
                    </div>
            }

            <UpdateDialog onClose={() => setCheckUpdatesIsCompleted(true)} />
        </>
    )
}

export default LoginPage;