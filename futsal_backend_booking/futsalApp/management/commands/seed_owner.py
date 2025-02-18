from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from futsalApp.models import BusinessInfo, TimeSlot, Amenity, Facility
from django.conf import settings

class Command(BaseCommand):
    help = 'Seed the OWNER user and BusinessInfo'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        owner_email = 'owner@gmail.com'
        owner_password = 'admin'
        owner_phone = '+9779812345678'

        if not User.objects.filter(email=owner_email).exists():
            owner = User.objects.create_superuser(
                email=owner_email,
                name='Owner',
                password=owner_password,
                role='OWNER',
                phone=owner_phone,
                is_email_verified=True
            )
            self.stdout.write(self.style.SUCCESS('Successfully seeded OWNER user'))
        else:
            owner = User.objects.get(email=owner_email)
            self.stdout.write(self.style.WARNING('OWNER user already exists'))

        # Seed BusinessInfo
        if not BusinessInfo.objects.filter(name='Futsal Business').exists():
            BusinessInfo.objects.create(
                name='Futsal Business',
                address='123 Futsal Street, Kathmandu, Nepal',
                phone='+9779812345678',
                email='info@futsalbusiness.com',
                website='https://www.futsalbusiness.com',
                opening_time='06:00:00',
                closing_time='22:00:00',
                description='The best futsal facility in town.',
                booking_notice='2 hours',
                cancellation_policy='Cancellations must be made at least 24 hours in advance.',
                payment_options=['Cash', 'Credit Card', 'Online Payment'],
                created_by=owner
            )
            self.stdout.write(self.style.SUCCESS('Successfully seeded BusinessInfo'))
        else:
            self.stdout.write(self.style.WARNING('BusinessInfo already exists'))
            
        # Seed Facility
        if not Facility.objects.filter(name='Main Futsal Field').exists():
            Facility.objects.create(
                name='Main Futsal Field',
                type='Indoor',
                address='123 Futsal Street, Kathmandu, Nepal',
                surface='Artificial Turf',
                size='40x20',
                capacity=10,
                status='active',
                created_by=owner
            )
            self.stdout.write(self.style.SUCCESS('Successfully seeded Facility'))
        else:
            self.stdout.write(self.style.WARNING('Facility already exists'))    

        # Seed TimeSlot
        facility = Facility.objects.first()  # Assuming you have at least one facility
        if facility and not TimeSlot.objects.filter(field=facility).exists():
            time_slots = []
            start_hour = 8
            end_hour = 22  # Assuming the facility closes at 22:00

            for hour in range(start_hour, end_hour):
                time_slots.append(TimeSlot(
                    field=facility,
                    day='Weekdays',
                    start_time=f'{hour:02}:00:00',
                    end_time=f'{hour + 1:02}:00:00',
                    price=1000.00,
                    discounted_price=800.00,
                    status='available',
                    created_by=owner
                ))

            TimeSlot.objects.bulk_create(time_slots)
            self.stdout.write(self.style.SUCCESS('Successfully seeded TimeSlot'))
        else:
            self.stdout.write(self.style.WARNING('TimeSlot already exists or no Facility found'))

        # Seed Amenity
        if not Amenity.objects.filter(name='Free WiFi').exists():
            Amenity.objects.create(
                name='Free WiFi',
                description='High-speed internet access',
                status=True,
                created_by=owner
            )
            self.stdout.write(self.style.SUCCESS('Successfully seeded Amenity'))
        else:
            self.stdout.write(self.style.WARNING('Amenity already exists'))