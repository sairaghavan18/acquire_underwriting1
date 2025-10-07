from langsmith import traceable
import os
print("Endpoint:", os.getenv("LANGCHAIN_ENDPOINT"))
print("Key present:", bool(os.getenv("LANGCHAIN_API_KEY")))
print("Project:", os.getenv("LANGCHAIN_PROJECT"))
@traceable(name="test_trace")
def test_func(x):
    return x * 2

print(test_func(10))