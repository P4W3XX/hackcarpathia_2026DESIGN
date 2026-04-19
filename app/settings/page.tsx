"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import { updateProfileAction, deleteAccountAction, logoutAction } from "@/actions/auth-action";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export default function SettingsPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "", // These should ideally be passed as props or fetched
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setServerError(null);
    setSuccessMessage(null);
    const result = await updateProfileAction(data);
    if (result?.error) {
      setServerError(result.error);
    } else {
      setSuccessMessage("Profile updated successfully");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setIsDeleting(true);
      await deleteAccountAction();
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ustawienia profilu</h1>
        <p className="text-muted-foreground">Zarządzaj swoimi danymi i ustawieniami.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Informacje o profilu</CardTitle>
            <CardDescription>Uaktualnij swoje imię i nazwisko oraz adres e-mail.</CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
                {serverError}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md mb-4 border border-green-500/20">
                {successMessage}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} id="profile-form">
              <FieldGroup className="gap-4">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[15px]">Imie i nazwisko</FieldLabel>
                      <Input {...field} placeholder="Twoje imię i nazwisko" type="text"/>
                      {fieldState.error && (
                        <p className="text-sm text-destructive">{fieldState.error.message}</p>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[15px]">Adres e-mail</FieldLabel>
                      <Input {...field} placeholder="email@example.com" type="email" />
                      {fieldState.error && (
                        <p className="text-sm text-destructive">{fieldState.error.message}</p>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 py-4 flex justify-end">
            <Button type="submit" form="profile-form" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zapisz zmiany
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Strefa administratora</CardTitle>
            <CardDescription>Możliwe niodwracalne zmiany dla twojego profilu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Wyloguj</p>
                <p className="text-sm text-muted-foreground">Wyloguj się ze swojego konta.</p>
              </div>
              <Button variant="outline" onClick={() => logoutAction()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Usuń konto</p>
                <p className="text-sm text-muted-foreground">Usuń swoje konto i swoje dane na stałe.</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span className="ml-2">Usuń konto</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
