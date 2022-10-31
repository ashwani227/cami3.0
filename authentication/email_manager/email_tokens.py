
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six


class EmailTokenGenerator(PasswordResetTokenGenerator):
    """
    A class that generates email activation tokens
    """

    def _make_hash_value(self, user, timestamp):
        """
        This function hashes user's primary key, activation status
        and time stamp to generate a six based encrypted token.
        :param user: An instance of CustomUser model
        :param timestamp: When the registration was performed by the user
        :return: A six based encoded token
        """
        return (
                six.text_type(user.pk) +
                six.text_type(timestamp) +
                six.text_type(user.is_active)
        )


account_activation_token = EmailTokenGenerator()
