import json
import random

first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Rahul", "Priya", "Anjali", "Sneha", "Kavya", "Divya", "Neha", "Rohan", "Kabir", "Aryan", "Vikas", "Suresh", "Ramesh", "Amit", "Amitabh", "Anil", "Sunil", "Pooja", "Aarti", "Ishita", "Meera", "Siddharth", "Gaurav", "Manish", "Sandeep", "Karan", "Nitin"]
last_names = ["Sharma", "Patil", "Deshmukh", "Joshi", "Kulkarni", "Singh", "Yadav", "Verma", "Rao", "Iyer", "Nair", "Das", "Bose", "Gupta", "Agarwal", "Mishra", "Pandey", "Mehta", "Shah", "Chopra", "Chauhan", "Bhatia"]

def random_phone():
    return str(random.randint(9000000000, 9999999999))

dataset = []
true_uniques = 140
duplicate_clusters = 30 # each cluster will have 1 base + 1 or 2 variations

print("Generating 70% Base Users...")
# Generate unique base users
base_users = []
for i in range(true_uniques):
    fname = random.choice(first_names)
    lname = random.choice(last_names)
    base_users.append({
        "name": f"{fname} {lname}",
        "email": f"{fname.lower()}.{lname.lower()}{random.randint(1,99)}@gmail.com",
        "phone": random_phone(),
        "role": random.choice(["Volunteer", "Participant", "Participant"]) # heavily lean to participant
    })

dataset.extend(base_users)

print("Generating 30% Intentional Variations/Duplicates...")
# Grab some users to create duplicates
for i in range(duplicate_clusters):
    base = base_users[i]
    fname, lname = base["name"].split(' ', 1)
    
    variation_type = random.choice(["name_short", "typo", "email_alias", "phone_off", "ambiguous"])
    
    dup = base.copy()
    
    if variation_type == "name_short":
        # Initial vs Full Name
        dup["name"] = f"{fname[0]}. {lname}"
    
    elif variation_type == "typo":
        # Add random double letter
        dup["name"] = f"{fname}{fname[-1]} {lname}"
        
    elif variation_type == "email_alias":
        # Gmail aliasing plus sign
        dup["email"] = base["email"].replace("@", "+event@")
        
    elif variation_type == "phone_off":
        # Phone off by 1 digit
        phone = list(base["phone"])
        phone[-1] = str((int(phone[-1]) + 1) % 10)
        dup["phone"] = "".join(phone)
        
    elif variation_type == "ambiguous":
        # Swapped first & last name, different number completely, but same email domain parsing
        dup["name"] = f"{lname} {fname}"
        dup["phone"] = random_phone()
        dup["email"] = f"{fname[0]}{lname.lower()}@yahoo.com"
        
    dataset.append(dup)
    
random.shuffle(dataset)

with open("ml_duplicate_test_dataset.json", "w") as f:
    json.dump(dataset, f, indent=4)

print(f"Generated {len(dataset)} payload entries inside ml_duplicate_test_dataset.json!")
