import { Button } from "@/components/ui/button";

import { SignUpButton as ClerkSignUpButton, SignInButton as ClerkSignInButton, SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

export function SignUpButton({ children = <Button>Sign Up</Button>, ...props }: React.ComponentProps<typeof ClerkSignUpButton>) {
    return <ClerkSignUpButton {...props}>{children}</ClerkSignUpButton>
}

export function SignInButton({ children = <Button>Sign In</Button>, ...props }: React.ComponentProps<typeof ClerkSignInButton>) {
    return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>
}

export function SignOutButton({ children = <Button>Sign Out</Button>, ...props }: React.ComponentProps<typeof ClerkSignOutButton>) {
    return <ClerkSignOutButton {...props}>{children}</ClerkSignOutButton>
}