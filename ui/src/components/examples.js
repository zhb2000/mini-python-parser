const fibonacci =
    `# Python program to display the Fibonacci sequence

def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)


a = fibonacci(10)
print(a)
`;

export { fibonacci };
